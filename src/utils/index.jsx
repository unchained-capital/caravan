import React from "react";
import BigNumber from "bignumber.js";
import { estimateMultisigTransactionFee } from "unchained-bitcoin/lib/fees";

import { DUST_IN_SATOSHIS } from "./constants";

export function externalLink(url, text) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  );
}

export function wrapText(text, columns) {
  const lines = [];
  let index = 0;
  let element = 0;
  while (index <= text.length) {
    lines.push(
      <span key={element}>{text.slice(index, (index += columns || 64))}</span>
    );
    lines.push(<br key={element + 1} />);
    element += 2;
  }
  return lines;
}

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
 * simple coin selection
 * @param {Array<object>} spendableInputs - available addresses with balanceSats property as a BigNumber
 * @param {BigNumber} outputTotal - how much is being spent including estimated fees
 * @returns {Array<object>} list of address objects meeting the outputTotal or all if insufficient.
 */
export function naiveCoinSelection(spendableInputs, outputTotal) {
  const selectedUtxos = [];
  let inputTotal = new BigNumber(0);
  for (
    let inputIndex = 0;
    inputIndex < spendableInputs.length;
    inputIndex += 1
  ) {
    const spendableInput = spendableInputs[inputIndex];
    spendableInput.utxos.forEach((utxo) => {
      selectedUtxos.push({
        ...utxo,
        multisig: spendableInput.multisig,
        bip32Path: spendableInput.bip32Path,
        change: spendableInput.change,
      });
    });
    inputTotal = inputTotal.plus(spendableInput.balanceSats);
    if (inputTotal.isGreaterThanOrEqualTo(outputTotal)) {
      break;
    }
  }
  return selectedUtxos;
}

/**
 * @description A utility function to determine if a spend is a valid
 * "spend all" transaction,
 * @param {Object} options - set of options used to determine if is spend all
 * @param {Object[]} options.outputs
 * @param {string} options.outputs[].amountSats
 * @param {string|number} options.walletBalance
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
  const estimatedFees = estimateMultisigTransactionFee(config).toNumber();
  const outputTotal = config.outputs.reduce((balance, output) => {
    const amountSats = parseInt(output.amountSats, 10);
    // eslint-disable-next-line no-param-reassign
    balance += amountSats;
    return balance;
  }, 0);

  if (outputTotal + estimatedFees > options.walletBalance)
    throw new Error("Wallet balance is insufficient to fund transaction");

  if (outputTotal + estimatedFees + DUST_IN_SATOSHIS < options.walletBalance)
    return false;

  return true;
}
