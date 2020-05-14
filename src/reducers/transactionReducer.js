import BigNumber from "bignumber.js";
import {
  MAINNET,
  P2SH,
  estimateMultisigTransactionFee,
  validateFeeRate,
  validateFee,
  validateOutputAmount,
  satoshisToBitcoins,
  bitcoinsToSatoshis,
  validateAddress,
  unsignedMultisigTransaction,
} from "unchained-bitcoin";
import updateState from "./utils";

import { SET_NETWORK, SET_ADDRESS_TYPE } from "../actions/settingsActions";
import {
  CHOOSE_PERFORM_SPEND,
  SET_REQUIRED_SIGNERS,
  SET_TOTAL_SIGNERS,
  SET_INPUTS,
  ADD_OUTPUT,
  SET_OUTPUT_ADDRESS,
  SET_OUTPUT_AMOUNT,
  DELETE_OUTPUT,
  SET_FEE_RATE,
  SET_FEE,
  FINALIZE_OUTPUTS,
  RESET_OUTPUTS,
  SET_TXID,
  RESET_TRANSACTION,
  SET_IS_WALLET,
  SET_CHANGE_OUTPUT_INDEX,
  UPDATE_AUTO_SPEND,
  SET_SIGNING_KEY,
  SET_CHANGE_ADDRESS,
  SET_BALANCE_ERROR,
  SET_SPEND_STEP,
  SPEND_STEP_CREATE,
} from "../actions/transactionActions";

import { RESET_NODES_SPEND } from "../actions/walletActions";

function sortInputs(a, b) {
  const x = a.txid.toLowerCase();
  const y = b.txid.toLowerCase();
  if (x < y) {
    return -1;
  }
  if (x > y) {
    return 1;
  }
  if (a.n < b.n) {
    return -1;
  }
  if (a.n > b.n) {
    return 1;
  }
  return 0;
}

export const initialOutputState = () => ({
  address: "",
  amount: "",
  amountSats: "",
  addressError: "",
  amountError: "",
});

const initialOutputsState = () => [initialOutputState()];

export const initialState = () => ({
  chosen: false,
  network: MAINNET,
  inputs: [],
  inputsTotalSats: new BigNumber(0),
  outputs: initialOutputsState(),
  changeOutputIndex: 0,
  feeRate: "",
  feeRateError: "",
  fee: "",
  feeError: "",
  finalizedOutputs: false,
  txid: "",
  balanceError: "",
  addressType: P2SH,
  requiredSigners: 2,
  totalSigners: 3,
  unsignedTransaction: {},
  isWallet: false,
  autoSpend: true,
  changeAddress: "",
  updatesComplete: true,
  signingKeys: [0, 0], // default 2 required signers
  spendingStep: SPEND_STEP_CREATE,
});

function updateInputs(state, action) {
  const inputsTotalSats = action.value.reduce(
    (accumulator, input) => accumulator.plus(input.amountSats),
    new BigNumber(0)
  );
  return updateState(state, {
    inputs: action.value.sort(sortInputs),
    inputsTotalSats,
  });
}

function calcOutputTotalSats(state) {
  return state.outputs.reduce(
    (accumulator, { amount }) =>
      accumulator.plus(bitcoinsToSatoshis(new BigNumber(amount || 0))),
    new BigNumber(0)
  );
}

function setFeeForRate(state, feeRateString, nout) {
  return satoshisToBitcoins(
    estimateMultisigTransactionFee({
      addressType: state.addressType,
      numInputs: state.inputs.length,
      numOutputs: nout,
      m: state.requiredSigners,
      n: state.totalSigners,
      feesPerByteInSatoshis: feeRateString,
    })
  )
    .toFixed(8)
    .toString();
}

function deleteOutput(state, action) {
  const newState = { ...state };
  const newOutputs = [];
  for (let i = 0; i < newState.outputs.length; i += 1) {
    if (i !== action.number - 1) {
      newOutputs.push(newState.outputs[i]);
    } else if (action.number === newState.changeOutputIndex) {
      newState.changeOutputIndex = 0;
    }
    if (action.number < newState.changeOutputIndex)
      newState.changeOutputIndex -= 1;
  }
  return {
    ...newState,
    ...{
      outputs: newOutputs,
      fee: setFeeForRate(newState, newState.feeRate, newOutputs.length),
    },
  };
}

function updateFeeRate(state, action) {
  const feeRateString = action.value;
  const feeRateError = validateFeeRate(feeRateString);
  const fee =
    feeRateError === ""
      ? setFeeForRate(state, feeRateString, state.outputs.length)
      : "";

  return updateState(state, {
    feeRate: feeRateString,
    feeRateError,
    fee,
    feeError: "",
  });
}

function updateFee(state, action) {
  const feeString = action.value;
  const feeSats = bitcoinsToSatoshis(feeString);
  const feeError = validateFee(feeSats, state.inputsTotalSats);

  return updateState(state, {
    fee: feeString,
    feeError,
    feeRateError: "",
  });
}

function addOutput(state) {
  const newOutputs = state.outputs.concat(initialOutputState());
  return {
    ...state,
    ...{
      outputs: newOutputs,
      fee: setFeeForRate(state, state.feeRate, newOutputs.length),
    },
  };
}

function updateOutputAddress(state, action) {
  const newOutputs = [...state.outputs];
  const address = action.value;
  let error = validateAddress(address, state.network);
  if (error === "") {
    for (
      let inputIndex = 0;
      inputIndex < state.inputs.length;
      inputIndex += 1
    ) {
      const input = state.inputs[inputIndex];
      if (input.multisig && address === input.multisig.address) {
        error = "Output address cannot equal input address.";
        break;
      }
    }
  }
  if (error === "") {
    for (
      let outputIndex = 0;
      outputIndex < state.outputs.length;
      outputIndex += 1
    ) {
      if (outputIndex !== action.number - 1) {
        if (state.outputs[outputIndex].address === address) {
          error = "Duplicate output address.";
          break;
        }
      }
    }
  }
  newOutputs[action.number - 1].address = address;
  newOutputs[action.number - 1].addressError = error;
  return {
    ...state,
    ...{ outputs: newOutputs },
  };
}

function updateOutputAmount(state, action) {
  const newOutputs = [...state.outputs];
  let amount = action.value;
  const amountSats = bitcoinsToSatoshis(BigNumber(amount));
  let error = state.inputs.length
    ? validateOutputAmount(amountSats, state.inputsTotalSats)
    : "";
  if (state.isWallet && error === "Output amount is too large.") error = "";
  if (state.isWallet && action.number === state.changeOutputIndex) error = "";

  const dp = BigNumber(amount).dp();
  if (dp > 8) amount = amount.slice(0, 8 - dp);

  newOutputs[action.number - 1].amount = amount;
  newOutputs[action.number - 1].amountError = error;
  newOutputs[action.number - 1].amountSats = error ? "" : amountSats;
  return {
    ...state,
    ...{ outputs: newOutputs },
  };
}

function finalizeOutputs(state, action) {
  const unsignedTransaction = unsignedMultisigTransaction(
    state.network,
    state.inputs,
    state.outputs
  );
  return {
    ...state,
    ...{ finalizedOutputs: action.value, unsignedTransaction },
  };
}

function updateRequiredSigners(state, action) {
  return updateState(state, {
    requiredSigners: action.value,
    signingKeys: Array(action.value).fill(0),
  });
}

function updateSigningKey(state, action) {
  const signingKeys = [...state.signingKeys];
  signingKeys[action.number - 1] = action.value;
  return updateState(state, { signingKeys });
}

function outputInitialStateForMode(state) {
  let newState = updateState(state, {
    outputs: initialOutputsState(),
    fee: "",
    balanceError: "",
    changeOutputIndex: 0,
  });

  if (newState.isWallet) {
    newState = addOutput(newState);
    newState = updateState(newState, { changeOutputIndex: 2 });
    newState = updateOutputAmount(newState, { number: 2, value: "0" });
    newState = updateOutputAddress(newState, {
      number: 2,
      value: newState.changeAddress,
    });
  }

  return newState;
}

function resetTransactionState(state) {
  let newState = updateState(state, {
    ...initialState(),
    totalSigners: state.totalSigners,
    network: state.network,
    addressType: state.addressType,
    isWallet: state.isWallet,
    changeAddress: state.changeAddress,
  });
  newState = updateRequiredSigners(newState, { value: state.requiredSigners });
  newState = outputInitialStateForMode(newState);
  return newState;
}

function validateTransaction(state) {
  let newState = { ...state };
  // TODO: need less hacky way to supress error
  if (
    newState.outputs.find(
      (output) => output.addressError !== "" || output.amountError !== ""
    ) ||
    newState.feeError !== "" ||
    newState.feeRateError !== "" ||
    newState.inputs.length === 0
  ) {
    return {
      ...newState,
      balanceError: "",
    };
  }
  const feeSats = bitcoinsToSatoshis(new BigNumber(newState.fee));
  const outputTotalSats = calcOutputTotalSats(newState);
  if (!newState.inputsTotalSats.isEqualTo(outputTotalSats.plus(feeSats))) {
    const diff = outputTotalSats.plus(feeSats).minus(newState.inputsTotalSats);
    let balanceError = "";
    if (diff.isNaN()) {
      balanceError = "Cannot calculate total.";
    } else {
      newState = updateState(newState, { updatesComplete: true });
      const action = diff.isLessThan(0) ? "Increase" : "Decrease";
      balanceError = `${action} by ${satoshisToBitcoins(
        diff.absoluteValue()
      ).toFixed(8)}.`;
    }
    return {
      ...newState,
      balanceError,
    };
  }
  const minFee = new BigNumber(setFeeForRate(newState, "1", 0));

  if (new BigNumber(newState.fee).isLessThan(minFee)) {
    return {
      ...newState,
      balanceError: `Fee is too small. Should be no less than ${bitcoinsToSatoshis(
        minFee
      )} satoshis.`,
    };
  }

  return {
    ...newState,
    balanceError: "",
  };
}

export default (state = initialState(), action) => {
  switch (action.type) {
    case CHOOSE_PERFORM_SPEND:
      return updateState(state, { chosen: true });
    case SET_NETWORK:
      return updateState(state, { network: action.value });
    case SET_ADDRESS_TYPE:
      return updateState(state, { addressType: action.value });
    case SET_REQUIRED_SIGNERS:
      return updateRequiredSigners(state, action);
    case SET_TOTAL_SIGNERS:
      return updateState(state, { totalSigners: action.value });
    case SET_INPUTS:
      return validateTransaction(updateInputs(state, action));
    case ADD_OUTPUT:
      return validateTransaction(addOutput(state, action));
    case SET_CHANGE_OUTPUT_INDEX:
      return updateState(state, { changeOutputIndex: action.value });
    case SET_OUTPUT_ADDRESS:
      return validateTransaction(updateOutputAddress(state, action));
    case SET_OUTPUT_AMOUNT:
      return validateTransaction(updateOutputAmount(state, action));
    case DELETE_OUTPUT:
      return validateTransaction(deleteOutput(state, action));
    case SET_FEE_RATE:
      return validateTransaction(updateFeeRate(state, action));
    case SET_FEE:
      return validateTransaction(updateFee(state, action));
    case FINALIZE_OUTPUTS:
      return finalizeOutputs(state, action);
    case RESET_OUTPUTS:
      return outputInitialStateForMode(state);
    case SET_TXID:
      return updateState(state, { txid: action.value });
    case SET_IS_WALLET:
      return updateState(state, { isWallet: true });
    case RESET_TRANSACTION:
      return resetTransactionState(state);
    case UPDATE_AUTO_SPEND:
      return updateState(state, { autoSpend: action.value });
    case SET_SIGNING_KEY:
      return updateSigningKey(state, action);
    case SET_CHANGE_ADDRESS:
      return updateState(state, { changeAddress: action.value });
    case RESET_NODES_SPEND:
      return updateInputs(state, { value: [] });
    case SET_BALANCE_ERROR:
      return updateState(state, { balanceError: action.value });
    case SET_SPEND_STEP:
      return updateState(state, { spendingStep: action.value });
    default:
      return state;
  }
};
