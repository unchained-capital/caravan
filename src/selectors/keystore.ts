import { KeystoreState } from "../reducers/keystoreReducer";

export const getKeystore = (state: { keystore: KeystoreState }) =>
  state.keystore;
