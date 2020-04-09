import { PENDING } from "unchained-wallets";

import {
  SET_KEYSTORE,
  SET_KEYSTORE_NOTE,
  SET_KEYSTORE_STATUS,
} from "../actions/keystoreActions";

const initialState = {
  type: "",
  version: "",
  note: "",
  status: PENDING,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_KEYSTORE:
      return {
        ...state,
        ...{ type: action.keystoreType, version: action.version },
      };
    case SET_KEYSTORE_NOTE:
      return {
        ...state,
        ...{ note: action.value },
      };
    case SET_KEYSTORE_STATUS:
      return {
        ...state,
        ...{ status: action.value },
      };
    default:
      return state;
  }
};
