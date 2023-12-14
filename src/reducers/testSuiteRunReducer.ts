import moment from "moment";
import { PENDING, ACTIVE } from "unchained-wallets";

import { SUITE } from "../tests";

import { SET_KEYSTORE, SetKeystoreAction } from "../actions/keystoreActions";
import {
  START_TEST_SUITE_RUN,
  SET_CURRENT_TEST_RUN,
  TestSuiteRunActionTypes,
} from "../actions/testSuiteRunActions";
import {
  START_TEST_RUN,
  END_TEST_RUN,
  RESET_TEST_RUN,
  SET_TEST_RUN_NOTE,
  TestRunActionTypes,
} from "../actions/testRunActions";

export interface TestRunState {
  startedAt?: moment.Moment | "";
  endedAt?: moment.Moment | "";
  status?: string;
  message?: string;
  note?: string;
  test?: any;
}

export interface TestSuiteRunState {
  started: boolean;
  startedAt: moment.Moment | "";
  endedAt: moment.Moment | "";
  testRuns: TestRunState[];
  currentTestRunIndex: number;
}

const initialTestRunState: TestRunState = {
  startedAt: "",
  endedAt: "",
  status: PENDING,
  message: "",
  note: "",
};

const initialState: TestSuiteRunState = {
  started: false,
  startedAt: "",
  endedAt: "",
  testRuns: [],
  currentTestRunIndex: -1,
};

// TODO: when unchained-wallets types are implemented, remove this cast
const typedSuite = SUITE as unknown as {
  [key: string]: { [key: string]: any }[];
};

const testRunsForKeystore = (action: SetKeystoreAction) => {
  if (action.keystoreType === "") {
    return [];
  }
  return (typedSuite[action.keystoreType] || []).map((test) => {
    return {
      ...initialTestRunState,
      ...{ test },
    };
  });
};

const updatedTestRun = (
  state: TestSuiteRunState,
  testRunIndex: number,
  update?: TestRunState
) => {
  return {
    ...state,
    ...{
      testRuns: state.testRuns.map((testRun, i) => {
        if (i === testRunIndex) {
          return {
            ...testRun,
            ...update,
          };
        }
        return testRun;
      }),
    },
  };
};

export default (
  state: TestSuiteRunState = initialState,
  action: TestSuiteRunActionTypes | SetKeystoreAction | TestRunActionTypes
) => {
  switch (action.type) {
    case SET_KEYSTORE:
      return {
        ...state,
        ...{ testRuns: testRunsForKeystore(action) },
      };
    case START_TEST_SUITE_RUN:
      return {
        ...state,
        ...{
          started: true,
          startedAt: moment(),
          currentTestRunIndex: 0,
        },
      };
    case SET_CURRENT_TEST_RUN:
      return {
        ...state,
        ...{ currentTestRunIndex: action.value },
      };
    case START_TEST_RUN:
      return updatedTestRun(state, action.testRunIndex, {
        startedAt: moment(),
        status: ACTIVE,
      });
    case END_TEST_RUN:
      return updatedTestRun(state, action.testRunIndex, {
        endedAt: moment(),
        status: action.status,
        message: action.message,
      });
    case RESET_TEST_RUN:
      return updatedTestRun(state, action.testRunIndex, initialTestRunState);
    case SET_TEST_RUN_NOTE:
      return updatedTestRun(state, action.testRunIndex, { note: action.note });
    default:
      return state;
  }
};
