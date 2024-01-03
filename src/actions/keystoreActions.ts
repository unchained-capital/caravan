import { TREZOR, LEDGER, HERMIT, COLDCARD } from "unchained-wallets";

export const SET_KEYSTORE = "SET_KEYSTORE";
export const SET_KEYSTORE_NOTE = "SET_KEYSTORE_NOTE";
export const SET_KEYSTORE_STATUS = "SET_KEYSTORE_STATUS";

type KeyStoreType =
  | typeof TREZOR
  | typeof LEDGER
  | typeof HERMIT
  | typeof COLDCARD;

export type SetKeystoreAction = {
  type: typeof SET_KEYSTORE;
  keystoreType: KeyStoreType;
  version: string;
};

export type SetKeystoreNoteAction = {
  type: typeof SET_KEYSTORE_NOTE;
  value: string;
};

type SetKeystoreStatusAction = {
  type: typeof SET_KEYSTORE_STATUS;
  value: string;
};

export type KeystoreActionTypes =
  | SetKeystoreAction
  | SetKeystoreNoteAction
  | SetKeystoreStatusAction;

export function setKeystore(
  keystoreType: KeyStoreType,
  version: string
): SetKeystoreAction {
  return {
    type: SET_KEYSTORE,
    keystoreType,
    version,
  };
}

export function setKeystoreNote(text: string): SetKeystoreNoteAction {
  return {
    type: SET_KEYSTORE_NOTE,
    value: text,
  };
}

export function setKeystoreStatus(status: string): SetKeystoreStatusAction {
  return {
    type: SET_KEYSTORE_STATUS,
    value: status,
  };
}
