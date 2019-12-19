export const SET_ERROR_NOTIFICATION = "SET_ERROR_NOTIFICATION";
export const CLEAR_ERROR_NOTIFICATION = "CLEAR_ERROR_NOTIFICATION";

export function setErrorNotification(message) {
  return {
    type: SET_ERROR_NOTIFICATION,
    value: message,
  };
}

export function clearErrorNotification() {
  return {
    type: CLEAR_ERROR_NOTIFICATION,
  };
}
