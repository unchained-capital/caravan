import BigNumber from "bignumber.js";
import { estimateMultisigTransactionFee } from "unchained-bitcoin";

import { DUST_IN_SATOSHIS } from "./constants";

export { default as wrapText } from "./WrapText";

export function validatePositiveInteger(numberString) {
  if (
    numberString === null ||
    numberString === undefined ||
    numberString === ""
  ) {
    return "Cannot be blank.";
  }
  const number = parseInt(numberString, 10);
  if (
    Number.isNaN(number) ||
    number.toString().length !== numberString.length ||
    number <= 0
  ) {
    return "Must be a positive whole number.";
  }

  return "";
}

export function downloadFile(body, filename) {
  const blob = new Blob([body], { type: "text/plain" });
  if (window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  } else {
    const elem = window.document.createElement("a");
    elem.href = window.URL.createObjectURL(blob);
    elem.download = filename;
    document.body.appendChild(elem);
    elem.click();
    document.body.removeChild(elem);
  }
}

/**
 * @description A utility function to determine if a spend is a valid
 * "spend all" transaction,
 * @param {Object} options - set of options used to determine if is spend all
 * @param {Object[]} options.outputs
 * @param {string} options.outputs[].amountSats
 * @param {string} options.walletBalance
 * @param {string} options.feesPerByteInSatoshis
 * @param {number} options.numInputs
 * @param {string} options.addressType
 * @param {number} options.m
 * @param {number} options.n
 * @returns {boolean} whether or not conditions are met to be "spendAll"
 */
export function isSpendAll(options) {
  const config = {
    ...options,
    numOutputs: options.outputs.length,
  };
  const estimatedFees = Number(estimateMultisigTransactionFee(config));
  const outputTotal = config.outputs.reduce((balance, output) => {
    return balance.plus(output.amountSats);
  }, new BigNumber(0));

  if (outputTotal.plus(estimatedFees).isGreaterThan(options.walletBalance))
    throw new Error("Wallet balance is insufficient to fund transaction");

  // if the difference between walletBalance minus fees
  // and the output total is less than or equal to dust
  // then this is a spend all.
  return new BigNumber(options.walletBalance)
    .minus(estimatedFees)
    .minus(outputTotal)
    .isLessThanOrEqualTo(DUST_IN_SATOSHIS);
}

/**
 * @description a naive coin selection algorithm that goes through available,
 * spendable slices, adding them together to sufficiently fund a tx with a
 * given set of outputs and address/wallet type.
 * **IMPORTANT**: this assumes no change output in the set of outputs given.
 * and it will indicate if the returned set of utxos sufficiently cover the output
 * and fees w/o need of change.
 * @param {Object} options - set of options used to determine if is spend all
 * @param {Object[]} options.outputs
 * @param {string} options.feesPerByteInSatoshis
 * @param {number} options.slices - spendable slices to select utxos from
 * @param {string} options.addressType
 * @param {number} options.m
 * @param {number} options.n
 * @returns {Array.<Object[]|boolean>} a tuple where the first index is the list of
 * inputs and the second index is a bool representing whether a change address is needed
 */
export function naiveCoinSelection(options) {
  const { slices, outputs } = options;
  const { count: numInputs, balance: walletBalance } = slices.reduce(
    ({ count, balance }, slice) => {
      return {
        count: count + slice.utxos.length,
        balance: slice.balanceSats.plus(balance),
      };
    },
    {
      count: 0,
      balance: new BigNumber(0),
    }
  );

  const outputTotal = outputs.reduce(
    (total, output) => total.plus(output.amountSats),
    new BigNumber(0)
  );

  const selectedUtxos = [];
  let changeRequired;
  let inputTotal = new BigNumber(0);

  // checking if is a spendall to confirm that change is not required
  const spendAll = isSpendAll({
    ...options,
    walletBalance,
    numInputs,
  });

  if (spendAll) changeRequired = false;

  // loop through each slice
  for (let i = 0; i < slices.length; i += 1) {
    const slice = slices[i];
    const { utxos } = slice;
    // add each utxo from the slice to the inputs array
    for (let j = 0; j < utxos.length; j += 1) {
      selectedUtxos.push({
        ...utxos[j],
        multisig: slice.multisig,
        bip32Path: slice.bip32Path,
        change: slice.change,
      });
    }
    // add slice's balance to the inputs total
    inputTotal = inputTotal.plus(slice.balanceSats);

    // we can skip the following checks if it is a spend all tx
    if (!spendAll) {
      // calculate fees with a change address and without
      // to evaluate if we need to keep going or not
      const feesWithoutChange = estimateMultisigTransactionFee({
        ...options,
        numInputs: selectedUtxos.length,
        numOutputs: outputs.length,
      });
      const feesWithChange = estimateMultisigTransactionFee({
        ...options,
        numInputs: selectedUtxos.length,
        numOutputs: outputs.length + 1,
      });

      const inputOutputDiff = inputTotal.minus(outputTotal);
      if (
        inputOutputDiff
          .minus(feesWithoutChange)
          .isLessThanOrEqualTo(DUST_IN_SATOSHIS) &&
        inputOutputDiff.minus(feesWithoutChange).isGreaterThanOrEqualTo(0)
      ) {
        // if value of inputs covers outputs and fees w/o change output and
        // has only dust left over, then no change is required and we're done
        changeRequired = false;
        break;
      } else if (inputOutputDiff.isGreaterThan(feesWithChange)) {
        // value of current inputs covers outputs and fees w/ change output
        // so our tx is funded but needs change.
        changeRequired = true;
        break;
      }
      // if inputs don't cover outputs plus change output and fees,
      // then the loop will continue to add more inputs
    }
  }
  return [selectedUtxos, changeRequired];
}
