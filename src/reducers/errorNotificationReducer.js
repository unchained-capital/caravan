import {
  SET_ERROR_NOTIFICATION,
  CLEAR_ERROR_NOTIFICATION,
} from "../actions/errorNotificationActions";

const initialState = {
  message: "",
  open: false,
};

export default (state = initialState, action) => {
  switch (action.type) {
    case SET_ERROR_NOTIFICATION:
      return {
        ...state,
        ...{ open: true, message: action.value },
      };
    case CLEAR_ERROR_NOTIFICATION:
      return {
        ...state,
        ...{ open: false, message: "" },
      };
    default:
      return state;
  }
};
