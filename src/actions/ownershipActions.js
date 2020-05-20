export const CHOOSE_CONFIRM_OWNERSHIP = "CHOOSE_CONFIRM_OWNERSHIP";
export const SET_OWNERSHIP_MULTISIG = "SET_OWNERSHIP_MULTISIG";
export const RESET_PUBLIC_KEY_IMPORTER = "RESET_PUBLIC_KEY_IMPORTER";
export const RESET_PUBLIC_KEY_IMPORTER_BIP32_PATH =
  "RESET_PUBLIC_KEY_IMPORTER_BIP32_PATH";
export const SET_PUBLIC_KEY_IMPORTER_BIP32_PATH =
  "SET_PUBLIC_KEY_IMPORTER_BIP32_PATH";
export const SET_PUBLIC_KEY_IMPORTER_METHOD = "SET_PUBLIC_KEY_IMPORTER_METHOD";
export const SET_PUBLIC_KEY_IMPORTER_PUBLIC_KEY =
  "SET_PUBLIC_KEY_IMPORTER_PUBLIC_KEY";

export function chooseConfirmOwnership() {
  return {
    type: CHOOSE_CONFIRM_OWNERSHIP,
  };
}

export function setOwnershipMultisig(value) {
  return {
    type: SET_OWNERSHIP_MULTISIG,
    value,
  };
}

export function resetPublicKeyImporter() {
  return {
    type: RESET_PUBLIC_KEY_IMPORTER,
  };
}

export function resetPublicKeyImporterBIP32Path() {
  return {
    type: RESET_PUBLIC_KEY_IMPORTER_BIP32_PATH,
  };
}

export function setPublicKeyImporterBIP32Path(value) {
  return {
    type: SET_PUBLIC_KEY_IMPORTER_BIP32_PATH,
    value,
  };
}

export function setPublicKeyImporterMethod(value) {
  return {
    type: SET_PUBLIC_KEY_IMPORTER_METHOD,
    value,
  };
}

export function setPublicKeyImporterPublicKey(value) {
  return {
    type: SET_PUBLIC_KEY_IMPORTER_PUBLIC_KEY,
    value,
  };
}
