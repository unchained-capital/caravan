import assert from "assert";
import BigNumber from "bignumber.js";
import {
  TEST_FIXTURES,
  estimateMultisigTransactionFee,
  P2SH,
  P2SH_P2WSH,
  P2WSH,
} from "unchained-bitcoin";

import { DUST_IN_SATOSHIS } from "./constants";
import {
  isSpendAll,
  naiveCoinSelection,
  uncompressedPublicKeyError,
} from "./index";
import { getMockState } from "./fixtures";
import { getSpendableSlices } from "../selectors/wallet";

function getConfig(fixture, feeRate) {
  const {
    type: addressType,
    multisig,
    transaction: { outputs },
    utxos,
  } = fixture;
  const numInputs = utxos.length;
  const numOutputs = outputs.length;

  // p2sh-p2wsh has m/n embedeed so need to go two scripts deep
  const { m, n } = multisig.redeem.redeem
    ? multisig.redeem.redeem
    : multisig.redeem;

  const outputTotal = outputs.reduce((balance, output) => {
    return balance.plus(output.amountSats);
  }, new BigNumber(0));

  return {
    addressType,
    outputs,
    numInputs,
    numOutputs,
    m,
    n,
    feesPerByteInSatoshis: feeRate,
    outputTotal,
  };
}

describe("utils", () => {
  describe("isSpendAll", () => {
    const feesPerByteInSatoshis = "10";
    it("should correctly identify a spend all tx", () => {
      TEST_FIXTURES.multisigs.forEach((fixture) => {
        const config = getConfig(fixture, feesPerByteInSatoshis);
        const fees = estimateMultisigTransactionFee(config).toNumber();

        // for a spendAll tx, the diff between wallet balance minus fees and output amount
        // should be less than dust limit
        let walletBalance = config.outputTotal.plus(fees);
        const { addressType, numInputs, numOutputs } = config;

        // this would be a perfect spend all where the difference between
        // wallet balance and outputs is equal to fees
        assert.equal(
          isSpendAll({ ...config, walletBalance }),
          true,
          `Should be true for ${addressType}, ${numInputs} inputs and ${numOutputs} outputs`
        );
        // check for a difference that is less than dust amount
        walletBalance = walletBalance.plus(Math.ceil(DUST_IN_SATOSHIS / 2));

        assert.equal(
          isSpendAll({ ...config, walletBalance }),
          true,
          `Should be true for ${addressType}, ${numInputs} inputs and ${numOutputs} outputs when difference is dust`
        );
      });
    });

    it("should correctly identify a tx that is not spending all inputs", () => {
      TEST_FIXTURES.multisigs.forEach((fixture) => {
        const config = getConfig(fixture, feesPerByteInSatoshis);
        const walletBalance = config.outputTotal.multipliedBy(2).toFixed();
        assert.equal(
          isSpendAll({ ...config, walletBalance }),
          false,
          `Should be false for ${config.addressType}, ${walletBalance} wallet balance and ${config.outputTotal} output value`
        );
      });
    });

    it("should throw if walletBalance is not enough to cover outputs and fees", () => {
      TEST_FIXTURES.multisigs.forEach((fixture) => {
        const config = getConfig(fixture, feesPerByteInSatoshis);
        const fees = estimateMultisigTransactionFee(config).toNumber();
        const walletBalance = config.outputTotal.minus(fees);
        const test = () => isSpendAll({ ...config, walletBalance });
        expect(test).toThrow();
      });
    });
  });

  describe("naiveCoinSelection", () => {
    let state;
    let slices;
    let options;
    let walletBalance;
    let output;
    let totalUtxoCount;

    beforeEach(() => {
      state = getMockState({ confirmedBalance: 100000 });
      slices = getSpendableSlices(state);
      walletBalance = slices.reduce(
        (balance, slice) => balance.plus(slice.balanceSats),
        new BigNumber(0)
      );
      totalUtxoCount = slices.reduce(
        (count, slice) => count + slice.utxos.length,
        0
      );
      output = {
        // testnet faucet address
        address: "2NGZrVvZG92qGYqzTLjCAewvPZ7JE8S8VxE",
        amountSats: "0",
      };

      options = {
        addressType: P2WSH,
        slices,
        m: 2,
        n: 2,
        feesPerByteInSatoshis: 3,
        outputs: [],
      };
    });

    it("should return full set of all spendable utxos if is a spendAll tx", () => {
      // test with a tx that has one output with value equal to total value
      // of spendable slices minus fees
      const fee = estimateMultisigTransactionFee({
        ...options,
        numInputs: totalUtxoCount,
        numOutputs: 1,
      });
      output.amountSats = walletBalance.minus(fee).toFixed();
      options.outputs = [output];
      let [inputs, changeRequired] = naiveCoinSelection(options);
      expect(inputs).toHaveLength(totalUtxoCount);
      expect(changeRequired).toBe(false);

      // the result should be the same if the difference between output value
      // and wallet balance is fee plus dust
      output.amountSats = walletBalance
        .minus(fee)
        .minus(DUST_IN_SATOSHIS / 2)
        .toFixed();
      options.outputs = [output];
      [inputs, changeRequired] = naiveCoinSelection(options);
      expect(inputs).toHaveLength(totalUtxoCount);
      expect(changeRequired).toBe(false);
    });

    it("should return a valid set of inputs and no change when possible", () => {
      // naive coin selection just adds slice utxos in the order that they appear
      // so to test a no-change tx, we want to come up with an output value
      // that is equal to the first slice balances minus fees
      const slice = slices[0];
      const utxoCount = slice.utxos.length;
      const fee = estimateMultisigTransactionFee({
        ...options,
        numInputs: utxoCount,
        numOutputs: 1,
      });
      output.amountSats = slice.balanceSats.minus(fee).toFixed();
      options.outputs = [output];

      // calculate for comparisons in tests
      const expectedInputsTotal = new BigNumber(output.amountSats)
        .plus(fee)
        .toFixed();

      let [inputs, changeRequired] = naiveCoinSelection(options);
      let inputsTotal = inputs.reduce(
        (total, input) => total.plus(input.amountSats),
        new BigNumber(0)
      );

      expect(inputs).toHaveLength(utxoCount);
      expect(changeRequired).toBe(false);
      // confirm that the inputs add up to the expected amount
      expect(inputsTotal.toFixed()).toEqual(expectedInputsTotal);

      // the result should be the same if the difference between output value
      // and slice balance is fee plus dust
      output.amountSats = slice.balanceSats
        .minus(fee)
        .minus(DUST_IN_SATOSHIS / 2)
        .toFixed();
      options.outputs = [output];
      [inputs, changeRequired] = naiveCoinSelection(options);
      expect(inputs).toHaveLength(utxoCount);
      expect(changeRequired).toBe(false);
      inputsTotal = inputs.reduce(
        (total, input) => total.plus(input.amountSats),
        new BigNumber(0)
      );

      // confirm that the inputs add up to the expected amount
      expect(inputsTotal.toFixed()).toEqual(expectedInputsTotal);
    });

    it("should return a valid set of inputs with change when necessary", () => {
      // going to use both spendable slices for this one but the output value
      // should be greater than dust and less than balance of second slice so that
      // we can expect change to be required.
      const fee = estimateMultisigTransactionFee({
        ...options,
        numInputs: totalUtxoCount,
        numOutputs: 1,
      });

      // half the second slice balance plus the whole first slice balance
      output.amountSats = slices[1].balanceSats
        .dividedBy(2)
        .plus(slices[0].balanceSats)
        .toFixed();

      const slicesBalance = slices[0].balanceSats.plus(slices[1].balanceSats);

      // sanity check, esp in case fixtures change for some reason
      assert(
        slicesBalance
          .minus(fee)
          .minus(output.amountSats)
          .isGreaterThan(DUST_IN_SATOSHIS),
        `Test slices balance amount minus fee and output
 should be greater than dust so that change is required`
      );

      options.outputs = [output];

      const [inputs, changeRequired] = naiveCoinSelection(options);

      // should be using all utxos
      expect(inputs).toHaveLength(
        slices[0].utxos.length + slices[1].utxos.length
      );
      expect(changeRequired).toBe(true);
    });

    it("should throw if available balance is not enough to fund the outputs", () => {
      output.amountSats = walletBalance.plus(1000);
      options.outputs = [output];
      const test = () => naiveCoinSelection(options);
      expect(test).toThrow();
    });
  });

  describe("uncompressedPublicKeyError", () => {
    const compressedPublicKey =
      "0239b046b986903f1f4dc3c81e2e113718ad7e9ea9f4740a39fbc89974f65391bd";
    const uncompressedPublicKey =
      "04a17f3ad2ecde2fff2abd1b9ca77f35d5449a3b50a8b2dc9a0b5432d6596afd01ee884006f7e7191f430c7881626b95ae1bcacf9b54d7073519673edaea71ee53";
    const invalidPublicKey =
      "0139b046b986903f1f4dc3c81e2e113718ad7e9ea9f4740a39fbc89974f65391bd";
    // P2SH
    it("should correctly indentify that a compressed public used for P2SH has no error", () => {
      assert.equal(
        uncompressedPublicKeyError(compressedPublicKey, P2SH),
        false,
        `Should be false for a compressed public key and a ${P2SH} address type`
      );
    });
    it("should correctly indentify that an uncompressed public used for P2SH has no error", () => {
      assert.equal(
        uncompressedPublicKeyError(uncompressedPublicKey, P2SH),
        false,
        `Should be false for an uncompressed public key and a ${P2SH} address type`
      );
    });
    it("should correctly indentify that an invalid public used for P2SH has no error", () => {
      assert.equal(
        uncompressedPublicKeyError(invalidPublicKey, P2SH),
        false,
        `Should be false for a invalid public key and a ${P2SH} address type`
      );
    });
    // P2SH-P2WSH
    it("should correctly indentify that a compressed public used for P2SH-P2WSH has no error", () => {
      assert.equal(
        uncompressedPublicKeyError(compressedPublicKey, P2SH_P2WSH),
        false,
        `Should be false for a compressed public key and a ${P2SH_P2WSH} address type`
      );
    });
    it("should correctly indentify that an compressed public used for P2SH-P2WSH is erroneous", () => {
      assert.equal(
        uncompressedPublicKeyError(uncompressedPublicKey, P2SH_P2WSH),
        true,
        `Should be false for a invalid public key and a ${P2SH_P2WSH} address type`
      );
    });
    it("should correctly indentify that an invalid public used for P2SH-P2WSH has no error", () => {
      assert.equal(
        uncompressedPublicKeyError(invalidPublicKey, P2SH_P2WSH),
        false,
        `Should be false for a invalid public key and a ${P2SH_P2WSH} address type`
      );
    });
    // P2WSH
    it("should correctly indentify that a compressed public used for P2WSH has no error", () => {
      assert.equal(
        uncompressedPublicKeyError(compressedPublicKey, P2WSH),
        false,
        `Should be false for a compressed public key and a ${P2WSH} address type`
      );
    });
    it("should correctly indentify that an compressed public used for P2WSH is erroneous", () => {
      assert.equal(
        uncompressedPublicKeyError(uncompressedPublicKey, P2WSH),
        true,
        `Should be false for a invalid public key and a ${P2WSH} address type`
      );
    });
    it("should correctly indentify that an invalid public used for P2WSH has no error", () => {
      assert.equal(
        uncompressedPublicKeyError(invalidPublicKey, P2WSH),
        false,
        `Should be false for a invalid public key and a ${P2WSH} address type`
      );
    });
  });
});
