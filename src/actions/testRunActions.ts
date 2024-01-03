export const START_TEST_RUN = "START_TEST_RUN";
export const END_TEST_RUN = "END_TEST_RUN";
export const RESET_TEST_RUN = "RESET_TEST_RUN";
export const SET_TEST_RUN_NOTE = "SET_TEST_RUN_NOTE";

type StartTestRunAction = {
  type: typeof START_TEST_RUN;
  testRunIndex: number;
};

type EndTestRunAction = {
  type: typeof END_TEST_RUN;
  testRunIndex: number;
  status: string;
  message: string;
};

type ResetTestRunAction = {
  type: typeof RESET_TEST_RUN;
  testRunIndex: number;
};

export type SetTestRunNoteAction = {
  type: typeof SET_TEST_RUN_NOTE;
  testRunIndex: number;
  note: string;
};

export type TestRunActionTypes =
  | StartTestRunAction
  | EndTestRunAction
  | ResetTestRunAction
  | SetTestRunNoteAction;

export function startTestRun(testRunIndex: number): StartTestRunAction {
  return {
    type: START_TEST_RUN,
    testRunIndex,
  };
}

export function endTestRun(
  testRunIndex: number,
  status: string,
  message: string
): EndTestRunAction {
  return {
    type: END_TEST_RUN,
    testRunIndex,
    status,
    message,
  };
}

export function resetTestRun(testRunIndex: number): ResetTestRunAction {
  return {
    type: RESET_TEST_RUN,
    testRunIndex,
  };
}

export function setTestRunNote(
  text: string,
  testRunIndex?: number
): SetTestRunNoteAction {
  return {
    type: SET_TEST_RUN_NOTE,
    testRunIndex: testRunIndex || 0,
    note: text,
  };
}
