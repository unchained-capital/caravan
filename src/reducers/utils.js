export function updateState(state, change) {
  return {
    ...state,
    ...change,
  };
}
