import {
  MAINNET,
  P2SH,
  multisigBIP32Path,
} from "unchained-bitcoin";
import { updateState } from './utils';
import {
  SET_TOTAL_SIGNERS,
} from "../actions/settingsActions";
import {
  SET_NETWORK,
  SET_ADDRESS_TYPE,
} from '../actions/settingsActions';
import {
  SET_PUBLIC_KEY_IMPORTER_NAME,
  RESET_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  SET_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  SET_PUBLIC_KEY_IMPORTER_METHOD,
  SET_PUBLIC_KEY_IMPORTER_PUBLIC_KEY,
  SET_PUBLIC_KEY_IMPORTER_FINALIZED,
  MOVE_PUBLIC_KEY_IMPORTER_UP,
  MOVE_PUBLIC_KEY_IMPORTER_DOWN,
  SORT_PUBLIC_KEY_IMPORTERS,
  UPDATE_MULTISIG_ADDRESS
} from '../actions/publicKeyImporterActions';

const TEXT = "text";

function fingerprint(state) {
  const timestamp = new Date().getTime().toString();
  const publicKeys = Object.values(state.publicKeyImporters).map((publicKeyImporter) => (publicKeyImporter.publicKey)).join('');
  return `${timestamp}-${publicKeys}`;
}

const initialPublicKeyImporterState = {
  name: '',
  bip32Path: multisigBIP32Path(P2SH, MAINNET),
  bip32PathModified: false,
  method: '',
  publicKey: '',
  finalized: false,
  conflict: false,
};

const initialState = {
  publicKeyImporters: {
    1: { ...initialPublicKeyImporterState, ...{name: "Public Key 1"} },
    2: { ...initialPublicKeyImporterState, ...{name: "Public Key 2"} },
    3: { ...initialPublicKeyImporterState, ...{name: "Public Key 3"} },
  },
  defaultBIP32Path: multisigBIP32Path(P2SH, MAINNET),
  network: MAINNET,
  addressType: P2SH,
  fingerprint: '',
  finalizedNetwork: '',
  finalizedAddressType: '',
  address: '',
};

function movePublicKeyImporterUp(state, action) {
  if (action.number === 1) { return state; }
  const newState = {
    ...state,
  };
  const abovePublicKeyImporter = state.publicKeyImporters[action.number-1];
  const publicKeyImporter = state.publicKeyImporters[action.number];
  newState.publicKeyImporters[action.number - 1] = publicKeyImporter;
  newState.publicKeyImporters[action.number] = abovePublicKeyImporter;
  return updateState(newState, {fingerprint: fingerprint(newState)});
}


function movePublicKeyImporterDown(state, action) {
  if (action.number === Object.values(state.publicKeyImporters).length) { return state; }
  const newState = {
    ...state,
   };
  const belowPublicKeyImporter = state.publicKeyImporters[action.number+1];
  const publicKeyImporter = state.publicKeyImporters[action.number];
  newState.publicKeyImporters[action.number + 1] = publicKeyImporter;
  newState.publicKeyImporters[action.number] = belowPublicKeyImporter;
  return updateState(newState, {fingerprint: fingerprint(newState)});
}

function sortPublicKeyImporters(state, action) {
  const publicKeyImporters = Object.values(state.publicKeyImporters);
  const sortedPublicKeys = publicKeyImporters.map((publicKeyImporter) => publicKeyImporter.publicKey).sort();
  const sortedPublicKeyImporters = sortedPublicKeys.map((publicKey) => {
    return publicKeyImporters.find((publicKeyImporter) => publicKeyImporter.publicKey === publicKey);
  });
  const publicKeyImportersChange = {};
  for (var publicKeyImporterNum=1; publicKeyImporterNum <= sortedPublicKeyImporters.length; publicKeyImporterNum++) {
    publicKeyImportersChange[publicKeyImporterNum] = sortedPublicKeyImporters[publicKeyImporterNum - 1];
  }

  const newState = {
    ...state,
    ...{publicKeyImporters: publicKeyImportersChange},
  };
  return updateState(newState, {fingerprint: fingerprint(newState)});
}

function updatePublicKeyImporterState(state, action, field) {
  const publicKeyImporterChange = {};
  publicKeyImporterChange[field] = action.value;
  const newState = {
    ...state,
  };
  newState.publicKeyImporters[action.number] = updateState(state.publicKeyImporters[action.number], publicKeyImporterChange);
  setConflict(newState.publicKeyImporters[action.number] ,state);
  return updateState(newState, {fingerprint: fingerprint(newState)});
}

function updateTotalSigners(state, action) {
  const totalSigners = action.value;
  const publicKeyImporters = {};
  for (let publicKeyImporterNum = 1; publicKeyImporterNum <= totalSigners; publicKeyImporterNum++) {
    publicKeyImporters[publicKeyImporterNum] = state.publicKeyImporters[publicKeyImporterNum] || {
      ...initialPublicKeyImporterState,
      ...{
        name: `Public Key ${publicKeyImporterNum}`,
      },
    };
  }
  const newState = {
    ...state,
    ...{publicKeyImporters, stub: action.type},
  };
  return updateState(newState, {fingerprint: fingerprint(newState)});
}

function setConflict(publicKeyImporter ,state) {
  if (state.finalizedNetwork) {
    publicKeyImporter.conflict = state.finalizedNetwork !== state.network || state.finalizedAddressType !== state.addressType;
  }
}

function updateImporterPaths(state, newState, bip32Path) {
  for (let publicKeyImporterNum = 1; publicKeyImporterNum <= Object.values(state.publicKeyImporters).length; publicKeyImporterNum++) {
    const publicKeyImporter = newState.publicKeyImporters[publicKeyImporterNum];
    if (!publicKeyImporter.bip32PathModified) {
      if (!publicKeyImporter.finalized) publicKeyImporter.bip32Path = bip32Path;
    }
    setConflict(publicKeyImporter, newState);
  }
}

function updateNetwork(state, action) {
  const network = action.value;
  const addressType = state.addressType;
  const bip32Path = multisigBIP32Path(addressType, network);
  const newState = {...state, ...{network, defaultBIP32Path: bip32Path}};
  updateImporterPaths(state, newState, bip32Path);
  return newState;
}

function updateAddressType(state, action) {
  const network = state.network;
  const addressType = action.value;
  const bip32Path = multisigBIP32Path(addressType, network);
  const newState = {...state, ...{addressType, defaultBIP32Path: bip32Path}};
  updateImporterPaths(state, newState, bip32Path);
  return newState;
}

function updateFinalizedSettings(state, action) {
  const newState = {...state}
  if (action.value === true && state.finalizedNetwork === '' && newState.publicKeyImporters[action.number].method !== TEXT) {
    newState.finalizedNetwork = state.network;
    newState.finalizedAddressType = state.addressType;
  } else if (action.value === false && state.finalizedNetwork !== '') {
    const finalizedCount = Object.values(state.publicKeyImporters).reduce((count, importer) => {
      if (importer.finalized === true && importer.method !== TEXT) return count+1; else return count
    }, 0);
    if (finalizedCount === 1) { // last one to be removed
      newState.finalizedNetwork = '';
      newState.finalizedAddressType = '';
      Object.values(newState.publicKeyImporters).forEach(importer => importer.conflict = false);
    }
  }
  return newState;
}

export default (state = initialState, action) => {
  switch (action.type) {
  case SET_NETWORK:
    return updateNetwork(state, action);
  case SET_ADDRESS_TYPE:
    return updateAddressType(state, action);
  case SET_TOTAL_SIGNERS:
    return updateTotalSigners(state, action);
  case SET_PUBLIC_KEY_IMPORTER_NAME:
    return updatePublicKeyImporterState(state, action, 'name');
  case RESET_PUBLIC_KEY_IMPORTER_BIP32_PATH:
    return updatePublicKeyImporterState(
      updatePublicKeyImporterState(state, {number: action.number, value: state.defaultBIP32Path}, 'bip32Path'),
      {number: action.number, value: false},
      "bip32PathModified");
  case SET_PUBLIC_KEY_IMPORTER_BIP32_PATH:
    return updatePublicKeyImporterState(
      updatePublicKeyImporterState(state, action, 'bip32Path'),
      {number: action.number, value: true},
      "bip32PathModified");
  case SET_PUBLIC_KEY_IMPORTER_METHOD:
    return updatePublicKeyImporterState(state, action, 'method');
  case SET_PUBLIC_KEY_IMPORTER_PUBLIC_KEY:
    return updatePublicKeyImporterState(state, action, 'publicKey');
  case SET_PUBLIC_KEY_IMPORTER_FINALIZED:
      return updatePublicKeyImporterState(updateFinalizedSettings(state, action), action, 'finalized');
  case MOVE_PUBLIC_KEY_IMPORTER_UP:
    return movePublicKeyImporterUp(state, action);
  case MOVE_PUBLIC_KEY_IMPORTER_DOWN:
    return movePublicKeyImporterDown(state, action);
  case SORT_PUBLIC_KEY_IMPORTERS:
    return sortPublicKeyImporters(state, action);
  case UPDATE_MULTISIG_ADDRESS:
    return updateState(state, {address: action.value});
  default:
    return state;
  }
};
