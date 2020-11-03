import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { PENDING, ACTIVE } from "unchained-wallets";

import {
  Grid,
  Box,
  Card,
  CardHeader,
  CardContent,
  Button,
  LinearProgress,
} from "@material-ui/core";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import * as testSuiteRunActions from "../../actions/testSuiteRunActions";
import KeystorePicker from "./KeystorePicker";
import TestSuiteRunSummary from "./TestSuiteRunSummary";
import TestRun from "./TestRun";
import Seed from "./Seed";

const SPACEBAR_CODE = 32;
const LEFT_ARROW_CODE = 37;
const UP_ARROW_CODE = 38;
const RIGHT_ARROW_CODE = 39;
const DOWN_ARROW_CODE = 40;

class TestSuiteRunBase extends React.Component {
  componentDidMount = () => {
    document.addEventListener("keydown", this.handleKeyDown);
  };

  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.handleKeyDown);
  };

  currentTestIsActive = () => {
    const { testSuiteRun } = this.props;
    if (!testSuiteRun.started) {
      return false;
    }
    const test = testSuiteRun.testRuns[testSuiteRun.currentTestRunIndex];
    if (!test) {
      return false;
    }
    return test.status === ACTIVE;
  };

  handleKeyDown = (event) => {
    const { testSuiteRun } = this.props;
    if (testSuiteRun.started) {
      if (this.currentTestIsActive()) {
        return;
      }
      switch (event.keyCode) {
        case LEFT_ARROW_CODE:
          if (!this.isFirstTest()) {
            this.previousTest();
          }
          break;
        case UP_ARROW_CODE:
          if (!this.isFirstTest()) {
            this.previousTest();
          }
          break;
        case RIGHT_ARROW_CODE:
          if (!this.isLastTest()) {
            this.nextTest();
          }
          break;
        case DOWN_ARROW_CODE:
          if (!this.isLastTest()) {
            this.nextTest();
          }
          break;
        default:
          break;
      }
    } else {
      if (event.keyCode !== SPACEBAR_CODE) {
        return;
      }
      const tag = event.target.tagName.toLowerCase();
      if (tag === "textarea" || tag === "input") {
        return;
      }
      event.preventDefault();
      if (this.startDisabled()) {
        return;
      }
      this.start();
    }
  };

  render = () => {
    const { testSuiteRun } = this.props;
    return (
      <Box mt={2}>
        {testSuiteRun.started && (
          <Box mt={2} mb={2}>
            <LinearProgress
              variant="determinate"
              value={
                100 *
                (testSuiteRun.testRuns.filter(
                  (testRun) =>
                    testRun.status !== PENDING && testRun.status !== ACTIVE
                ).length /
                  testSuiteRun.testRuns.length)
              }
            />
          </Box>
        )}
        <Grid container spacing={3}>
          <Grid item md={4}>
            <TestSuiteRunSummary />
          </Grid>
          <Grid item md={8}>
            {this.renderBody()}
          </Grid>
        </Grid>
      </Box>
    );
  };

  renderSetup = () => {
    const { keystore } = this.props;
    return (
      <Grid container direction="column" spacing={3}>
        <Grid item>
          <Card>
            <CardHeader title="Choose Keystore" />
            <CardContent>
              <KeystorePicker />
              <Box align="center" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={this.startDisabled()}
                  onClick={this.start}
                  type="submit"
                >
                  Begin Test Suite
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item>
          <Card>
            <CardHeader title="Keystore Setup" />
            <CardContent>
              <p>
                Ensure your keystore has been initialized with the following
                seed:
              </p>
              <Seed keystore={keystore} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  renderBody = () => {
    const { testSuiteRun } = this.props;
    if (testSuiteRun.started) {
      return (
        <Box>
          <TestRun
            isLastTest={this.isLastTest()}
            nextTest={this.nextTest}
            testRunIndex={testSuiteRun.currentTestRunIndex}
          />
          <Box mt={2}>
            <Grid container justify="space-between">
              <Grid item>
                <Button
                  disabled={this.isFirstTest() || this.currentTestIsActive()}
                  onClick={this.previousTest}
                >
                  <ArrowBack /> &nbsp; Previous
                </Button>
              </Grid>
              <Grid item>
                <Button
                  disabled={this.isLastTest() || this.currentTestIsActive()}
                  onClick={this.nextTest}
                >
                  Next &nbsp; <ArrowForward />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      );
    }
    return this.renderSetup();
  };

  start = () => {
    const { startTestSuiteRun } = this.props;
    startTestSuiteRun();
  };

  startDisabled = () => {
    const { testSuiteRun, keystore } = this.props;
    return (
      keystore.type === "" ||
      keystore.status === ACTIVE ||
      testSuiteRun.started ||
      testSuiteRun.testRuns.length === 0
    );
  };

  isFirstTest = () => {
    const { testSuiteRun } = this.props;
    return testSuiteRun.currentTestRunIndex === 0;
  };

  isLastTest = () => {
    const { testSuiteRun } = this.props;
    return (
      testSuiteRun.currentTestRunIndex === testSuiteRun.testRuns.length - 1
    );
  };

  previousTest = () => {
    const { testSuiteRun, setCurrentTestRun } = this.props;
    if (testSuiteRun.currentTestRunIndex < 1) {
      return;
    }
    setCurrentTestRun(testSuiteRun.currentTestRunIndex - 1);
  };

  nextTest = () => {
    const { testSuiteRun, setCurrentTestRun } = this.props;
    if (testSuiteRun.currentTestRunIndex === testSuiteRun.testRuns.length - 1) {
      return;
    }
    setCurrentTestRun(testSuiteRun.currentTestRunIndex + 1);
  };
}

TestSuiteRunBase.propTypes = {
  keystore: PropTypes.shape({
    note: PropTypes.string,
    type: PropTypes.string,
    status: PropTypes.string,
    version: PropTypes.string,
  }).isRequired,
  setCurrentTestRun: PropTypes.func.isRequired,
  startTestSuiteRun: PropTypes.func.isRequired,
  testSuiteRun: PropTypes.shape({
    currentTestRunIndex: PropTypes.number,
    started: PropTypes.bool,
    testRuns: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
};

const mapStateToProps = (state) => {
  return {
    keystore: state.keystore,
    testSuiteRun: state.testSuiteRun,
  };
};

const mapDispatchToProps = {
  ...testSuiteRunActions,
};

const TestSuiteRun = connect(
  mapStateToProps,
  mapDispatchToProps
)(TestSuiteRunBase);

export default TestSuiteRun;
