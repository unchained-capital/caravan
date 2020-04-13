import { wrappedNumberedActions } from "./utils";

export const SET_SIGNATURE_IMPORTER_NAME = "SET_SIGNATURE_IMPORTER_NAME";
export const SET_SIGNATURE_IMPORTER_METHOD = "SET_SIGNATURE_IMPORTER_METHOD";
export const SET_SIGNATURE_IMPORTER_BIP32_PATH =
  "SET_SIGNATURE_IMPORTER_BIP32_PATH";
export const SET_SIGNATURE_IMPORTER_PUBLIC_KEYS =
  "SET_SIGNATURE_IMPORTER_PUBLIC_KEYS";
export const SET_SIGNATURE_IMPORTER_SIGNATURE =
  "SET_SIGNATURE_IMPORTER_SIGNATURE";
export const SET_SIGNATURE_IMPORTER_FINALIZED =
  "SET_SIGNATURE_IMPORTER_FINALIZED";
export const SET_SIGNATURE_IMPORTER_COMPLETE =
  "SET_SIGNATURE_IMPORTER_COMPLETE";

export const {
  setSignatureImporterName,
  setSignatureImporterMethod,
  setSignatureImporterBIP32Path,
  setSignatureImporterPublicKeys,
  setSignatureImporterSignature,
  setSignatureImporterFinalized,
  setSignatureImporterComplete,
} = wrappedNumberedActions({
  setSignatureImporterName: SET_SIGNATURE_IMPORTER_NAME,
  setSignatureImporterMethod: SET_SIGNATURE_IMPORTER_METHOD,
  setSignatureImporterBIP32Path: SET_SIGNATURE_IMPORTER_BIP32_PATH,
  setSignatureImporterPublicKeys: SET_SIGNATURE_IMPORTER_PUBLIC_KEYS,
  setSignatureImporterSignature: SET_SIGNATURE_IMPORTER_SIGNATURE,
  setSignatureImporterFinalized: SET_SIGNATURE_IMPORTER_FINALIZED,
  setSignatureImporterComplete: SET_SIGNATURE_IMPORTER_COMPLETE,
});
