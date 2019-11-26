export const CHOOSE_PERFORM_SPEND = "CHOOSE_PERFORM_SPEND";

export const SET_REQUIRED_SIGNERS = 'SET_REQUIRED_SIGNERS';
export const SET_TOTAL_SIGNERS = 'SET_TOTAL_SIGNERS';

export const SET_INPUTS = 'SET_INPUTS';

export const ADD_OUTPUT = 'ADD_OUTPUT';
export const SET_OUTPUT_ADDRESS = 'SET_OUTPUT_ADDRESS';
export const SET_OUTPUT_AMOUNT = 'SET_OUTPUT_AMOUNT';
export const DELETE_OUTPUT = 'DELETE_OUTPUT';

export const SET_FEE_RATE = 'SET_FEE_RATE';
export const SET_FEE = 'SET_FEE';

export const FINALIZE_OUTPUTS = 'FINALIZE_OUTPUTS';
export const RESET_OUTPUTS = 'RESET_OUTPUTS';

export const SET_TXID = 'SET_TXID';
export const SET_IS_WALLET = 'SET_IS_WALLET';

export function choosePerformSpend() {
  return {
    type: CHOOSE_PERFORM_SPEND,
  };
}

export function setRequiredSigners(number) {
  return {
    type: SET_REQUIRED_SIGNERS,
    value: number,
  };
}

export function setTotalSigners(number) {
  return {
    type: SET_TOTAL_SIGNERS,
    value: number,
  };
}

export function setInputs(inputs) {
  return {
    type: SET_INPUTS,
    value: inputs,
  };
}

export function addOutput() {
  return {
    type: ADD_OUTPUT,
  };
}

export function setOutputAddress(number, address) {
  return {
    type: SET_OUTPUT_ADDRESS,
    number: number,
    value: address,
  };
}

export function setOutputAmount(number, amountString) {
  return {
    type: SET_OUTPUT_AMOUNT,
    number: number,
    value: amountString,
  };
}

export function deleteOutput(number) {
  return {
    type: DELETE_OUTPUT,
    number: number,
  };
}

export function setFeeRate(valueString) {
  return {
    type: SET_FEE_RATE,
    value: valueString,
  };
}

export function setFee(valueString) {
  return {
    type: SET_FEE,
    value: valueString,
  };
}

export function finalizeOutputs(finalized) {
  return {
    type: FINALIZE_OUTPUTS,
    value: finalized
  };
}

export function resetOutputs() {
  return {
    type: RESET_OUTPUTS,
  };
}


export function setTXID(txid) {
  return {
    type: SET_TXID,
    value: txid,
  };
}

export function setIsWallet() {
  return {
    type: SET_IS_WALLET,
  };
}
