export const START_TEST_RUN = "START_TEST_RUN";
export const END_TEST_RUN = "END_TEST_RUN";
export const RESET_TEST_RUN = "RESET_TEST_RUN";
export const SET_TEST_RUN_NOTE = "SET_TEST_RUN_NOTE";

export function startTestRun(testRunIndex) {
  return {
    type: START_TEST_RUN,
    testRunIndex,
  };
}

export function endTestRun(testRunIndex, status, message) {
  return {
    type: END_TEST_RUN,
    testRunIndex,
    status,
    message,
  };
}

export function resetTestRun(testRunIndex) {
  return {
    type: RESET_TEST_RUN,
    testRunIndex,
  };
}

export function setTestRunNote(testRunIndex, text) {
  return {
    type: SET_TEST_RUN_NOTE,
    testRunIndex,
    note: text,
  };
}
