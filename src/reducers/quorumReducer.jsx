import {
  MAINNET,
  P2SH,
  multisigBIP32Root,
} from "unchained-bitcoin";
import { updateState } from './utils';
import {
  SET_TOTAL_SIGNERS,
} from "../actions/settingsActions";
import {
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_NAME,
  RESET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_METHOD,
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_EXTENDED_PUBLIC_KEY,
  SET_EXTENDED_PUBLIC_KEY_IMPORTER_FINALIZED,
} from '../actions/extendedPublicKeyImporterActions';
import {
  SET_NETWORK,
  SET_ADDRESS_TYPE,
} from '../actions/settingsActions';

function fingerprint(state) {
  const timestamp = new Date().getTime().toString();
  const extendedPublicKeys = Object.values(state.extendedPublicKeyImporters).map((extendedPublicKeyImporter) => (extendedPublicKeyImporter.extendedPublicKey)).join('');
  return `${timestamp}-${extendedPublicKeys}`;
}

const initialExtendedPublicKeyImporterState = {
  name: '',
  bip32Path: multisigBIP32Root(P2SH, MAINNET),
  bip32PathModified: false,
  method: '',
  extendedPublicKey: '',
  finalized: false,
};

const initialState = {
  extendedPublicKeyImporters: {
    1: { ...initialExtendedPublicKeyImporterState, ...{name: "Extended Public Key 1"}  },
    2: { ...initialExtendedPublicKeyImporterState, ...{name: "Extended Public Key 2"}  },
    3: { ...initialExtendedPublicKeyImporterState, ...{name: "Extended Public Key 3"}  },
  },
  defaultBIP32Path: multisigBIP32Root(P2SH, MAINNET),
  network: MAINNET,
  addressType: P2SH,
  fingerprint: '',
};

function updateExtendedPublicKeyImporterState(state, action, field) {
  const extendedPublicKeyImporterChange = {};
  extendedPublicKeyImporterChange[field] = action.value;
  const newState = {
    ...state,
    ...{nodes: {}},
  };
  newState.extendedPublicKeyImporters[action.number] = updateState(state.extendedPublicKeyImporters[action.number], extendedPublicKeyImporterChange);
  return updateState(newState, {fingerprint: fingerprint(newState)});
}

function updateTotalSigners(state, action) {
  const totalSigners = action.value;
  const extendedPublicKeyImporters = {};
  for (let extendedPublicKeyImporterNum = 1; extendedPublicKeyImporterNum <= totalSigners; extendedPublicKeyImporterNum++) {
    extendedPublicKeyImporters[extendedPublicKeyImporterNum] = state.extendedPublicKeyImporters[extendedPublicKeyImporterNum] || {
      ...initialExtendedPublicKeyImporterState,
      ...{
        name: `Extended Public key ${extendedPublicKeyImporterNum}`,
      },
    };
  }

  return {
    ...state,
    ...{extendedPublicKeyImporters},
  };
}

function updateNetwork(state, action) {
  const addressType = state.addressType;
  const network = action.value;
  const bip32Path = multisigBIP32Root(addressType, network);
  const newState = {...state, ...{network, defaultBIP32Path: bip32Path}};
  for (let extendedPublicKeyImporterNum = 1; extendedPublicKeyImporterNum <= Object.values(state.extendedPublicKeyImporters).length; extendedPublicKeyImporterNum++) {
    const extendedPublicKeyImporter = newState.extendedPublicKeyImporters[extendedPublicKeyImporterNum];
    if (! extendedPublicKeyImporter.bip32PathModified) {
      extendedPublicKeyImporter.bip32Path = bip32Path;
    }
  }
  return newState;
}

function updateAddressType(state, action) {
  const addressType = action.value;
  const network = state.network;
  const bip32Path = multisigBIP32Root(addressType, network);
  const newState = {...state, ...{addressType, defaultBIP32Path: bip32Path}};
  for (let extendedPublicKeyImporterNum = 1; extendedPublicKeyImporterNum <= Object.values(state.extendedPublicKeyImporters).length; extendedPublicKeyImporterNum++) {
    const extendedPublicKeyImporter = newState.extendedPublicKeyImporters[extendedPublicKeyImporterNum];
    if (! extendedPublicKeyImporter.bip32PathModified) {
      extendedPublicKeyImporter.bip32Path = bip32Path;
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
  case SET_EXTENDED_PUBLIC_KEY_IMPORTER_NAME:
    return updateExtendedPublicKeyImporterState(state, action, 'name');
  case SET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH:
    return updateExtendedPublicKeyImporterState(
      updateExtendedPublicKeyImporterState(state, action, 'bip32Path'),
      {number: action.number, value: true},
      "bip32PathModified");
  case RESET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH:
    return updateExtendedPublicKeyImporterState(
      updateExtendedPublicKeyImporterState(state, {number: action.number, value: state.defaultBIP32Path}, 'bip32Path'),
      {number: action.number, value: false},
      "bip32PathModified");
  case SET_EXTENDED_PUBLIC_KEY_IMPORTER_METHOD:
    return updateExtendedPublicKeyImporterState(state, action, 'method');
  case SET_EXTENDED_PUBLIC_KEY_IMPORTER_EXTENDED_PUBLIC_KEY:
    return updateExtendedPublicKeyImporterState(state, action, 'extendedPublicKey');
  case SET_EXTENDED_PUBLIC_KEY_IMPORTER_FINALIZED:
    return updateExtendedPublicKeyImporterState(state, action, 'finalized');
  default:
    return state;
  }
};
