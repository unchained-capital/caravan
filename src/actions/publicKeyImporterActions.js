import { wrappedNumberedActions } from "./utils";

export const SET_PUBLIC_KEY_IMPORTER_NAME = "SET_PUBLIC_KEY_IMPORTER_NAME";
export const RESET_PUBLIC_KEY_IMPORTER_BIP32_PATH =
  "RESET_PUBLIC_KEY_IMPORTER_BIP32_PATH";
export const SET_PUBLIC_KEY_IMPORTER_BIP32_PATH =
  "SET_PUBLIC_KEY_IMPORTER_BIP32_PATH";
export const SET_PUBLIC_KEY_IMPORTER_METHOD = "SET_PUBLIC_KEY_IMPORTER_METHOD";
export const SET_PUBLIC_KEY_IMPORTER_PUBLIC_KEY =
  "SET_PUBLIC_KEY_IMPORTER_PUBLIC_KEY";
export const SET_PUBLIC_KEY_IMPORTER_FINALIZED =
  "SET_PUBLIC_KEY_IMPORTER_FINALIZED";
export const MOVE_PUBLIC_KEY_IMPORTER_UP = "MOVE_PUBLIC_KEY_IMPORTER_UP";
export const MOVE_PUBLIC_KEY_IMPORTER_DOWN = "MOVE_PUBLIC_KEY_IMPORTER_DOWN";
export const SORT_PUBLIC_KEY_IMPORTERS = "SORT_PUBLIC_KEY_IMPORTERS";
export const UPDATE_MULTISIG_ADDRESS = "UPDATE_MULTISIG_ADDRESS";

export function sortPublicKeyImporters() {
  return {
    type: SORT_PUBLIC_KEY_IMPORTERS,
  };
}

export function setMultisigAddress(address) {
  return {
    type: UPDATE_MULTISIG_ADDRESS,
    value: address,
  };
}

export const {
  setPublicKeyImporterName,
  setPublicKeyImporterBIP32Path,
  resetPublicKeyImporterBIP32Path,
  setPublicKeyImporterMethod,
  setPublicKeyImporterPublicKey,
  setPublicKeyImporterFinalized,
  movePublicKeyImporterUp,
  movePublicKeyImporterDown,
} = wrappedNumberedActions({
  setPublicKeyImporterName: SET_PUBLIC_KEY_IMPORTER_NAME,
  resetPublicKeyImporterBIP32Path: RESET_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  setPublicKeyImporterBIP32Path: SET_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  setPublicKeyImporterMethod: SET_PUBLIC_KEY_IMPORTER_METHOD,
  setPublicKeyImporterPublicKey: SET_PUBLIC_KEY_IMPORTER_PUBLIC_KEY,
  setPublicKeyImporterFinalized: SET_PUBLIC_KEY_IMPORTER_FINALIZED,
  movePublicKeyImporterUp: MOVE_PUBLIC_KEY_IMPORTER_UP,
  movePublicKeyImporterDown: MOVE_PUBLIC_KEY_IMPORTER_DOWN,
});
