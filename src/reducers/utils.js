function updateState(state, change) {
  return {
    ...state,
    ...change,
  };
}

export default updateState;
