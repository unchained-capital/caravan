export const START_TEST_SUITE_RUN = "START_TEST_SUITE_RUN";
export const SET_CURRENT_TEST_RUN = "SET_CURRENT_TEST_RUN";

export function startTestSuiteRun() {
  return {
    type: START_TEST_SUITE_RUN,
  };
}

export function setCurrentTestRun(runIndex) {
  return {
    type: SET_CURRENT_TEST_RUN,
    value: runIndex,
  };
}
