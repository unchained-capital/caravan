import updateState from "./utils";
import {
  SET_CLIENT_TYPE,
  SET_CLIENT_URL,
  SET_CLIENT_USERNAME,
  SET_CLIENT_PASSWORD,
  SET_CLIENT_URL_ERROR,
  SET_CLIENT_USERNAME_ERROR,
  SET_CLIENT_PASSWORD_ERROR,
} from "../actions/clientActions";

const initialState = {
  type: "public",
  url: "",
  username: "",
  password: "",
  urlError: "",
  usernameError: "",
  passwordError: "",
  status: "unknown",
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_CLIENT_TYPE:
      return updateState(state, { type: action.value });
    case SET_CLIENT_URL:
      return updateState(state, { url: action.value });
    case SET_CLIENT_USERNAME:
      return updateState(state, { username: action.value });
    case SET_CLIENT_PASSWORD:
      return updateState(state, { password: action.value });
    case SET_CLIENT_URL_ERROR:
      return updateState(state, { urlError: action.value });
    case SET_CLIENT_USERNAME_ERROR:
      return updateState(state, { usernameError: action.value });
    case SET_CLIENT_PASSWORD_ERROR:
      return updateState(state, { passwordError: action.value });

    default:
      return state;
  }
};
