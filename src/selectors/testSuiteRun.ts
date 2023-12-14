import { TestSuiteRunState } from "reducers/testSuiteRunReducer";

export const getTestSuiteRun = (state: { testSuiteRun: TestSuiteRunState }) =>
  state.testSuiteRun;
