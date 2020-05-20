import moment from "moment";
import { PENDING, ACTIVE } from "unchained-wallets";

import { SUITE } from "../tests";

import { SET_KEYSTORE } from "../actions/keystoreActions";
import {
  START_TEST_SUITE_RUN,
  SET_CURRENT_TEST_RUN,
} from "../actions/testSuiteRunActions";
import {
  START_TEST_RUN,
  END_TEST_RUN,
  RESET_TEST_RUN,
  SET_TEST_RUN_NOTE,
} from "../actions/testRunActions";

const initialTestRunState = {
  startedAt: "",
  endedAt: "",
  status: PENDING,
  message: "",
  note: "",
};

const initialState = {
  started: false,
  startedAt: "",
  endedAt: "",
  testRuns: [],
  currentTestRunIndex: -1,
};

const testRunsForKeystore = (action) => {
  if (action.keystoreType === "") {
    return [];
  }
  return (SUITE[action.keystoreType] || []).map((test) => {
    return {
      ...initialTestRunState,
      ...{ test },
    };
  });
};

const updatedTestRun = (state, testRunIndex, update) => {
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

export default (state = initialState, action) => {
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
