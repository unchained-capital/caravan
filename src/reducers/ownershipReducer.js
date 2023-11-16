import {
  P2SH,
  Network,
  multisigAddressType,
  multisigBIP32Path,
  multisigPublicKeys,
} from "unchained-bitcoin";
import updateState from "./utils";
import { SET_NETWORK } from "../actions/settingsActions";
import {
  CHOOSE_CONFIRM_OWNERSHIP,
  SET_OWNERSHIP_MULTISIG,
  RESET_PUBLIC_KEY_IMPORTER,
  RESET_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  SET_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  SET_PUBLIC_KEY_IMPORTER_METHOD,
  SET_PUBLIC_KEY_IMPORTER_PUBLIC_KEY,
} from "../actions/ownershipActions";

const initialPublicKeyImporterState = {
  bip32Path: "",
  method: "",
  publicKey: "",
};

const initialState = {
  chosen: false,
  publicKeyImporter: { ...initialPublicKeyImporterState },
  network: Network.MAINNET,
  addressType: P2SH,
  publicKeys: [],
  address: "",
  defaultBIP32Path: multisigBIP32Path(P2SH, Network.MAINNET),
};

function updatePublicKeyImporterState(state, action, field) {
  const publicKeyImporterChange = {};
  publicKeyImporterChange[field] = action.value;
  return {
    ...state,
    ...{
      publicKeyImporter: {
        ...state.publicKeyImporter,
        ...publicKeyImporterChange,
      },
    },
  };
}

function updateMultisig(state, action) {
  const multisig = action.value;
  const addressType = multisigAddressType(multisig);
  const defaultBIP32Path = multisigBIP32Path(addressType, state.network);
  return {
    ...state,
    ...{
      network: state.network,
      addressType,
      publicKeys: multisigPublicKeys(multisig),
      address: multisig.address,
      defaultBIP32Path,
    },
  };
}

export default (state = initialState, action) => {
  const keyResetState = updatePublicKeyImporterState(
    state,
    { value: "" },
    "publicKey"
  );

  switch (action.type) {
    case CHOOSE_CONFIRM_OWNERSHIP:
      return updateState(state, { chosen: true });
    case SET_NETWORK:
      return updateState(state, { network: action.value });
    case SET_OWNERSHIP_MULTISIG:
      return updateMultisig(state, action);
    case SET_PUBLIC_KEY_IMPORTER_BIP32_PATH:
      return updatePublicKeyImporterState(keyResetState, action, "bip32Path");
    case SET_PUBLIC_KEY_IMPORTER_METHOD:
      return updatePublicKeyImporterState(state, action, "method");
    case SET_PUBLIC_KEY_IMPORTER_PUBLIC_KEY:
      return updatePublicKeyImporterState(state, action, "publicKey");
    case RESET_PUBLIC_KEY_IMPORTER_BIP32_PATH:
      return updatePublicKeyImporterState(
        state,
        { value: state.defaultBIP32Path },
        "bip32Path"
      );
    case RESET_PUBLIC_KEY_IMPORTER:
      return {
        ...state,
        ...{
          publicKeyImporter: {
            ...state.publicKeyImporter,
            ...{ bip32Path: state.defaultBIP32Path, publicKey: "" },
          },
        },
      };
    default:
      return state;
  }
};
