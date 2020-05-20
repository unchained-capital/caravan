import updateState from "./utils";
import {
  SET_SIGNATURE_IMPORTER_NAME,
  SET_SIGNATURE_IMPORTER_METHOD,
  SET_SIGNATURE_IMPORTER_BIP32_PATH,
  SET_SIGNATURE_IMPORTER_SIGNATURE,
  SET_SIGNATURE_IMPORTER_PUBLIC_KEYS,
  SET_SIGNATURE_IMPORTER_FINALIZED,
  SET_SIGNATURE_IMPORTER_COMPLETE,
} from "../actions/signatureImporterActions";
import {
  SET_REQUIRED_SIGNERS,
  RESET_TRANSACTION,
} from "../actions/transactionActions";

const initialSignatureImporterState = {
  name: "",
  method: "",
  publicKeys: [],
  signature: [],
  bip32Path: "",
  finalized: false,
};

const initialState = {};

function setRequiredSigners(state, action) {
  const signatureImporters = {};
  for (
    let signatureImporterNum = 1;
    signatureImporterNum <= action.value;
    signatureImporterNum += 1
  ) {
    signatureImporters[signatureImporterNum] = {
      ...initialSignatureImporterState,
      ...{ name: `Signature ${signatureImporterNum}` },
    };
  }
  return signatureImporters;
}

function updateSignatureImporterState(state, action, field) {
  const signatureImporterChange = {};
  signatureImporterChange[field] = action.value;
  const newState = {
    ...state,
  };
  newState[action.number] = updateState(
    state[action.number],
    signatureImporterChange
  );
  return newState;
}

function finalizeSignatureImporterState(state, action) {
  const newState = {
    ...state,
  };
  newState[action.number] = updateState(state[action.number], action.value);
  return newState;
}

export default (state = initialState, action) => {
  switch (action.type) {
    case RESET_TRANSACTION:
      return { ...initialState };
    case SET_REQUIRED_SIGNERS:
      return setRequiredSigners(state, action);
    case SET_SIGNATURE_IMPORTER_NAME:
      return updateSignatureImporterState(state, action, "name");
    case SET_SIGNATURE_IMPORTER_METHOD:
      return updateSignatureImporterState(state, action, "method");
    case SET_SIGNATURE_IMPORTER_BIP32_PATH:
      return updateSignatureImporterState(state, action, "bip32Path");
    case SET_SIGNATURE_IMPORTER_SIGNATURE:
      return updateSignatureImporterState(state, action, "signature");
    case SET_SIGNATURE_IMPORTER_PUBLIC_KEYS:
      return updateSignatureImporterState(state, action, "publicKeys");
    case SET_SIGNATURE_IMPORTER_FINALIZED:
      return updateSignatureImporterState(state, action, "finalized");
    case SET_SIGNATURE_IMPORTER_COMPLETE:
      return finalizeSignatureImporterState(state, action);

    default:
      return state;
  }
};
