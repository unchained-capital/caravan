export const CHOOSE_PERFORM_SPEND = "CHOOSE_PERFORM_SPEND";

export const SET_REQUIRED_SIGNERS = "SET_REQUIRED_SIGNERS";
export const SET_TOTAL_SIGNERS = "SET_TOTAL_SIGNERS";

export const SET_INPUTS = "SET_INPUTS";

export const ADD_OUTPUT = "ADD_OUTPUT";
export const SET_OUTPUT_ADDRESS = "SET_OUTPUT_ADDRESS";
export const SET_OUTPUT_AMOUNT = "SET_OUTPUT_AMOUNT";
export const DELETE_OUTPUT = "DELETE_OUTPUT";

export const SET_FEE_RATE = "SET_FEE_RATE";
export const SET_FEE = "SET_FEE";

export const FINALIZE_OUTPUTS = "FINALIZE_OUTPUTS";
export const RESET_OUTPUTS = "RESET_OUTPUTS";

export const SET_TXID = "SET_TXID";
export const RESET_TRANSACTION = "RESET_TRANSACTION";
export const SET_IS_WALLET = "SET_IS_WALLET";
export const SET_CHANGE_OUTPUT_INDEX = "SET_CHANGE_OUTPUT_INDEX";
export const UPDATE_AUTO_SPEND = "UPDATE_AUTO_SPEND";
export const SET_CHANGE_ADDRESS = "SET_CHANGE_ADDRESS";
export const SET_SIGNING_KEY = "SET_SIGNING_KEY";
export const SET_SPEND_STEP = "SET_SPEND_STEP";
export const SET_BALANCE_ERROR = "SET_BALANCE_ERROR";
export const SPEND_STEP_CREATE = 0;
export const SPEND_STEP_PREVIEW = 1;
export const SPEND_STEP_SIGN = 2;

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

export function setChangeOutputIndex(number) {
  return {
    type: SET_CHANGE_OUTPUT_INDEX,
    value: number,
  };
}

export function setOutputAddress(number, address) {
  return {
    type: SET_OUTPUT_ADDRESS,
    number,
    value: address,
  };
}

export function setOutputAmount(number, amountString) {
  return {
    type: SET_OUTPUT_AMOUNT,
    number,
    value: amountString,
  };
}

export function setChangeAddressAction(value) {
  return {
    type: SET_CHANGE_ADDRESS,
    value,
  };
}

export function setChangeOutput({ value, address }) {
  return (dispatch, getState) => {
    const {
      spend: {
        transaction: { outputs, changeOutputIndex },
      },
    } = getState();
    // add output for change if there's none set (or it's set to zero)
    // if there's a change index then we use that
    // otherwise put it at the end of the outputs
    if (!changeOutputIndex) dispatch(addOutput());

    // output/change indexes are not zero-indexed
    const index = changeOutputIndex || outputs.length + 1;
    dispatch(setChangeOutputIndex(index));
    dispatch(setChangeAddressAction(address));
    dispatch(setOutputAddress(index, address));
    dispatch(setOutputAmount(index, value));
  };
}

export function deleteOutput(number) {
  return {
    type: DELETE_OUTPUT,
    number,
  };
}

export function deleteChangeOutput() {
  return (dispatch, getState) => {
    const { changeOutputIndex } = getState().spend.transaction;
    if (!changeOutputIndex) return;

    dispatch(deleteOutput(changeOutputIndex));
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
    value: finalized,
  };
}

export function resetOutputs() {
  return {
    type: RESET_OUTPUTS,
  };
}

export function setBalanceError(message) {
  return {
    type: SET_BALANCE_ERROR,
    value: message,
  };
}

export function resetTransaction() {
  return {
    type: RESET_TRANSACTION,
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

export function updateAutoSpendAction(value) {
  return {
    type: UPDATE_AUTO_SPEND,
    value,
  };
}

export function setSigningKey(number, extendedPublicKeyImporterIndex) {
  return {
    type: SET_SIGNING_KEY,
    number,
    value: extendedPublicKeyImporterIndex,
  };
}

export function setSpendStep(value) {
  return {
    type: SET_SPEND_STEP,
    value,
  };
}
