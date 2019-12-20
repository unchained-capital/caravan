import React from "react";
import BigNumber from 'bignumber.js'

export function externalLink(url, text) {
  return <a href={url} target="_blank" rel="noopener noreferrer">{text}</a>;
}

export function wrapText(text, columns) {
  let lines   = [];
  let index   = 0;
  let element = 0;
  while (index <= text.length) {
    lines.push(<span key={element}>{text.slice(index, index += (columns || 64))}</span>);
    lines.push(<br key={element + 1}/>);
    element += 2;
  }
  return lines;
}

export function validatePositiveInteger(numberString) {
  if (numberString === null || numberString === undefined || numberString === '') {
    return "Cannot be blank.";
  }
  const number = parseInt(numberString, 10);
  if (Number.isNaN(number) || number.toString().length !== numberString.length || number <= 0) {
    return "Must be a positive whole number.";
  }

  return '';

}

export function downloadFile(body, filename) {
  const blob = new Blob([body], {type: 'text/plain'});
  if(window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveBlob(blob, filename);
  }
  else{
      var elem = window.document.createElement('a');
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
  let selectedUtxos = [];
  let inputTotal = new BigNumber(0);
  for (let inputIndex=0; inputIndex < spendableInputs.length; inputIndex++) {
    const spendableInput = spendableInputs[inputIndex];
    spendableInput.utxos.forEach(utxo => {
      selectedUtxos.push({...utxo, multisig: spendableInput.multisig, bip32Path: spendableInput.bip32Path});
    })
    inputTotal = inputTotal.plus(spendableInput.balanceSats);
    if (inputTotal.isGreaterThanOrEqualTo(outputTotal)) {
      break;
    }
  }
  return selectedUtxos;
}
