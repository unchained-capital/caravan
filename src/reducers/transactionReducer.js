import BigNumber from 'bignumber.js';
import { updateState } from './utils';
import {
  MAINNET,
  P2SH,
  estimateMultisigTransactionFee,
  estimateMultisigTransactionFeeRate,
  validateFeeRate,
  validateFee,
  validateOutputAmount,
  satoshisToBitcoins,
  bitcoinsToSatoshis,
  validateAddress,
  unsignedMultisigTransaction,
} from "unchained-bitcoin";

import {
  SET_NETWORK,
  SET_ADDRESS_TYPE,
} from "../actions/settingsActions";
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
} from '../actions/transactionActions';

function sortInputs(a, b) {
  var x = a.txid.toLowerCase();
  var y = b.txid.toLowerCase();
  if (x < y) {return -1;}
  if (x > y) {return 1;}
  if (a.n < b.n) {return -1;}
  if (a.n > b.n) {return 1;}
  return 0;
};

const initialOutputState  = {
  address: '',
  amount: '',
  amountSats: '',
  addressError: '',
  amountError: '',
};

const initialOutputsState = () => [
  {...initialOutputState}
];

const initialState = {
  chosen: false,
  network: MAINNET,
  inputs: [],
  inputsTotalSats: new BigNumber(0),
  outputs: initialOutputsState(),
  changeOutputIndex: 0,
  feeRate: '',
  feeRateError: '',
  fee: '',
  feeError: '',
  finalizedOutputs: false,
  txid: '',
  balanceError: '',
  addressType: P2SH,
  requiredSigners: 2,
  totalSigners: 3,
  unsignedTransaction: {},
  isWallet: false,
};

function updateInputs(state, action) {
  const inputsTotalSats = action.value
        .map((input) => input.amountSats)
        .reduce(
          (accumulator, currentValue) => accumulator.plus(currentValue),
          new BigNumber(0));
  return updateState(
    state,
    {
      inputs: action.value.sort(sortInputs),
      inputsTotalSats,
    });
}

function validateTransaction(state) {
  if (
    state.outputs.find((output) => (output.addressError !== '' || output.amountError  !== ''))
      || state.feeError !== ''
      || state.feeRateError !== ''
      || state.inputs.length === 0
  ) {
    return {
      ...state,
      ...{balanceError: ""},
    };
  }
  const feeSats = bitcoinsToSatoshis(new BigNumber(state.fee));
  const outputTotalSats = state.outputs
        .map((output) => bitcoinsToSatoshis(new BigNumber(output.amount || 0)))
        .reduce(
          (accumulator, currentValue) => accumulator.plus(currentValue),
          new BigNumber(0));
  if (! state.inputsTotalSats.isEqualTo(outputTotalSats.plus(feeSats))) {
    const diff = outputTotalSats.plus(feeSats).minus(state.inputsTotalSats);
    let balanceError;
    if (diff.isNaN()) {
      balanceError = "Cannot calculate total.";
    } else{
      const action = diff.isLessThan(0) ? 'Increase' : 'Decrease';
      balanceError =`${action} by ${satoshisToBitcoins(diff.absoluteValue()).toFixed(8)}.`;
    }
    return {
      ...state,
      ...{balanceError},
    };
  } else {
    return {
      ...state,
      ...{balanceError: ''},
    };
  }
}

function setFeeForRate(state, feeRateString, nout) {
  return satoshisToBitcoins(estimateMultisigTransactionFee(
    {
      addressType: state.addressType,
      numInputs: state.inputs.length,
      numOutputs: nout,
      m: state.requiredSigners,
      n: state.totalSigners,
      feesPerByteInSatoshis: feeRateString
    })).toString();
}

function updateFeeRate(state, action) {
  const feeRateString = action.value;
  const feeRateError = validateFeeRate(feeRateString);
  const fee = (
    feeRateError === '' ?
      setFeeForRate(state, feeRateString, state.outputs.length) :
      '');

  return updateState(state, {
    feeRate: feeRateString,
    feeRateError,
    fee,
    feeError: '',
  });
}

function updateFee(state, action) {
  const feeString = action.value;
  const feeSats = bitcoinsToSatoshis(feeString);
  const feeError = validateFee(feeSats, state.inputsTotalSats);
  const feeRate = (
    feeError === '' ?
      estimateMultisigTransactionFeeRate(
        {
          addressType: state.addressType,
          numInputs: state.inputs.length,
          numOutputs: state.outputs.length,
          m: state.requiredSigners,
          n: state.totalSigners,
          feesInSatoshis: feeSats,
        }).toFixed(0)
      :
      '');

  return updateState(state, {
    fee: feeString,
    feeError,
    feeRate,
    feeRateError: '',
  });
}

function addOutput(state, action) {
  const newOutputs = state.outputs.concat({...initialOutputState});
  return {
    ...state,
    ...{outputs: newOutputs, fee: setFeeForRate(state, state.feeRate, newOutputs.length)},
  };
}

function updateOutputAddress(state, action) {
  const newOutputs = [...state.outputs];
  const address = action.value;
  let error = validateAddress(address, state.network);
  if (error === '') {
    for (var inputIndex=0; inputIndex < state.inputs.length; inputIndex++) {
      const input = state.inputs[inputIndex];
      if (address === input.address) {
        error = "Output address cannot equal input address.";
        break;
      }
    }
  }
  if (error === '') {
    for (var outputIndex=0; outputIndex < state.outputs.length; outputIndex++) {
      if (outputIndex !== (action.number - 1)) {
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
    ...{outputs: newOutputs},
  };
}

function updateOutputAmount(state, action) {
  const newOutputs = [...state.outputs];
  const amount = action.value;
  const amountSats = bitcoinsToSatoshis(BigNumber(amount));
  let error = state.inputs.length ? validateOutputAmount(amount, state.inputsTotalSats) : "";
  if (state.isWallet && error === "Output amount is too large.") error = ""

  newOutputs[action.number - 1].amount = amount;
  newOutputs[action.number - 1].amountError = error;
  newOutputs[action.number - 1].amountSats = (error ? '' : amountSats);
  return {
    ...state,
    ...{outputs: newOutputs},
  };
}

function deleteOutput(state, action) {
  const newOutputs = [];
  for (var i = 0; i < state.outputs.length; i++) {
    if (i !== (action.number - 1)) {
      newOutputs.push(state.outputs[i]);
    } else if (action.number === state.changeOutputIndex) {
      state.changeOutputIndex = 0;
    }
  }
  return {
    ...state,
    ...{outputs: newOutputs, fee: setFeeForRate(state, state.feeRate, newOutputs.length)},
  };
}

function finalizeOutputs(state, action) {
  const unsignedTransaction = unsignedMultisigTransaction(state.network, state.inputs, state.outputs);
  return {
    ...state,
    ...{finalizedOutputs: action.value, unsignedTransaction},
  };
}

export default (state = initialState, action) => {
  switch (action.type) {
  case CHOOSE_PERFORM_SPEND:
    return updateState(state, { chosen: true} );
  case SET_NETWORK:
    return updateState(state, { network: action.value });
  case SET_ADDRESS_TYPE:
    return updateState(state, { addressType: action.value });
  case SET_REQUIRED_SIGNERS:
    return updateState(state, { requiredSigners: action.value });
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
    return updateState(state, {
      outputs: initialOutputsState(),
      fee: '',
      balanceError: '',
      changeOutputIndex: 0,
      // FIXME what about feeRate ?
    });
  case SET_TXID:
    return updateState(state, { txid: action.value });
  case SET_IS_WALLET:
    return updateState(state, { isWallet: true} );
  case RESET_TRANSACTION:
    return updateState(state, initialState)
  default:
    return state;
  }
};
