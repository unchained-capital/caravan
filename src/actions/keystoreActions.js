export const SET_KEYSTORE = "SET_KEYSTORE";
export const SET_KEYSTORE_NOTE = "SET_KEYSTORE_NOTE";
export const SET_KEYSTORE_STATUS = "SET_KEYSTORE_STATUS";

export function setKeystore(keystoreType, version) {
  return {
    type: SET_KEYSTORE,
    keystoreType,
    version,
  };
}

export function setKeystoreNote(text) {
  return {
    type: SET_KEYSTORE_NOTE,
    value: text,
  };
}

export function setKeystoreStatus(status) {
  return {
    type: SET_KEYSTORE_STATUS,
    value: status,
  };
}
