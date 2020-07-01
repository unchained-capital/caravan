export const SET_NETWORK = "SET_NETWORK";
export const SET_TOTAL_SIGNERS = "SET_TOTAL_SIGNERS";
export const SET_REQUIRED_SIGNERS = "SET_REQUIRED_SIGNERS";
export const SET_STARTING_ADDRESS_INDEX = "SET_STARTING_ADDRESS_INDEX";
export const SET_ADDRESS_TYPE = "SET_ADDRESS_TYPE";
export const SET_FROZEN = "SET_FROZEN";

export function setNetwork(value) {
  return {
    type: SET_NETWORK,
    value,
  };
}

export function setTotalSigners(number) {
  return {
    type: SET_TOTAL_SIGNERS,
    value: number,
  };
}

export function setRequiredSigners(number) {
  return {
    type: SET_REQUIRED_SIGNERS,
    value: number,
  };
}

export function setStartingAddressIndex(number) {
  return {
    type: SET_STARTING_ADDRESS_INDEX,
    value: number,
  };
}

export function setAddressType(value) {
  return {
    type: SET_ADDRESS_TYPE,
    value,
  };
}

export function setFrozen(value) {
  return {
    type: SET_FROZEN,
    value,
  };
}
