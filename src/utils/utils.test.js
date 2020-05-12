import assert from "assert";
import {
  TEST_FIXTURES,
  estimateMultisigTransactionFee,
} from "unchained-bitcoin";

import { DUST_IN_SATOSHIS } from "./constants";
import { isSpendAll } from "./index";

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
    const amountSats = parseInt(output.amountSats, 10);
    // eslint-disable-next-line no-param-reassign
    balance += amountSats;
    return balance;
  }, 0);

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
        let walletBalance = config.outputTotal + fees;
        const { addressType, numInputs, numOutputs } = config;

        // this would be a perfect spend all where the difference between
        // wallet balance and outputs is equal to fees
        assert.equal(
          isSpendAll({ ...config, walletBalance }),
          true,
          `Should be true for ${addressType}, ${numInputs} inputs and ${numOutputs} outputs`
        );
        // check for a difference that is less than dust amount
        walletBalance += Math.ceil(DUST_IN_SATOSHIS / 2);

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
        const walletBalance = config.outputTotal * 2;
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
        const walletBalance = config.outputTotal - fees;
        const test = () => isSpendAll({ ...config, walletBalance });
        expect(test).toThrow();
      });
    });
  });
});
