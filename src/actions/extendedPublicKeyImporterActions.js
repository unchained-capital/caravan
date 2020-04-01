import { wrappedNumberedActions } from "./utils";

export const SET_EXTENDED_PUBLIC_KEY_IMPORTER_NAME        = "SET_EXTENDED_PUBLIC_KEY_IMPORTER_NAME";
export const RESET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH  = "RESET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH";
export const SET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH  = "SET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH";
export const SET_EXTENDED_PUBLIC_KEY_IMPORTER_METHOD = "SET_EXTENDED_PUBLIC_KEY_IMPORTER_METHOD";
export const SET_EXTENDED_PUBLIC_KEY_IMPORTER_EXTENDED_PUBLIC_KEY  = "SET_EXTENDED_PUBLIC_KEY_IMPORTER_EXTENDED_PUBLIC_KEY";
export const SET_EXTENDED_PUBLIC_KEY_IMPORTER_FINALIZED   = "SET_EXTENDED_PUBLIC_KEY_IMPORTER_FINALIZED";
export const SET_EXTENDED_PUBLIC_KEY_IMPORTER_VISIBLE   = "SET_EXTENDED_PUBLIC_KEY_IMPORTER_VISIBLE";
export const RESET_EXTENDED_PUBLIC_KEY_IMPORTER = "RESET_PUBLIC_KEY_IMPORTER";

export const {
  setExtendedPublicKeyImporterName,
  setExtendedPublicKeyImporterBIP32Path,
  resetExtendedPublicKeyImporterBIP32Path,
  setExtendedPublicKeyImporterMethod,
  setExtendedPublicKeyImporterExtendedPublicKey,
  setExtendedPublicKeyImporterFinalized,
} = wrappedNumberedActions({
  setExtendedPublicKeyImporterName: SET_EXTENDED_PUBLIC_KEY_IMPORTER_NAME,
  resetExtendedPublicKeyImporterBIP32Path: RESET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  setExtendedPublicKeyImporterBIP32Path: SET_EXTENDED_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  setExtendedPublicKeyImporterMethod: SET_EXTENDED_PUBLIC_KEY_IMPORTER_METHOD,
  setExtendedPublicKeyImporterExtendedPublicKey: SET_EXTENDED_PUBLIC_KEY_IMPORTER_EXTENDED_PUBLIC_KEY,
  setExtendedPublicKeyImporterFinalized: SET_EXTENDED_PUBLIC_KEY_IMPORTER_FINALIZED,
});

export function resetExtendedPublicKeyImporter() {
  return {
    type: RESET_EXTENDED_PUBLIC_KEY_IMPORTER,
  }
}

export function setExtendedPublicKeyImporterVisible(value) {
  return {
    type: SET_EXTENDED_PUBLIC_KEY_IMPORTER_VISIBLE,
    value: value
  };
}
