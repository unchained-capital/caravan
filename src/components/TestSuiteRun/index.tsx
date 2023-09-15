import React, { useEffect } from "react";
import { connect } from "react-redux";

import { PENDING, ACTIVE } from "unchained-wallets";

import {
  Grid,
  Box,
  Card,
  CardHeader,
  CardContent,
  Button,
  LinearProgress,
} from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import * as testSuiteRunActions from "../../actions/testSuiteRunActions";
import KeystorePicker from "./KeystorePicker";
import TestSuiteRunSummary from "./TestSuiteRunSummary";
import TestRun from "./TestRun";
import Seed from "./Seed";

const SPACEBAR_CODE = "Space";
const LEFT_ARROW_CODE = "ArrowLeft";
const UP_ARROW_CODE = "ArrowUp";
const RIGHT_ARROW_CODE = "ArrowRight";
const DOWN_ARROW_CODE = "ArrowDown";

interface TestSuiteRunBaseProps {
  keystore: {
    note: string;
    type: string;
    status: string;
    version: string;
  };
  setCurrentTestRun: (index: number) => void;
  startTestSuiteRun: () => void;
  testSuiteRun: {
    currentTestRunIndex: number;
    started: boolean;
    testRuns: any[];
  };
}

const TestSuiteRunBase = ({
  testSuiteRun,
  keystore,
  setCurrentTestRun,
  startTestSuiteRun,
}: TestSuiteRunBaseProps) => {
  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const currentTestIsActive = () => {
    if (!testSuiteRun.started) {
      return false;
    }
    const test = testSuiteRun.testRuns[testSuiteRun.currentTestRunIndex];
    if (!test) {
      return false;
    }
    return test.status === ACTIVE;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (testSuiteRun.started) {
      if (currentTestIsActive()) {
        return;
      }
      switch (event.code) {
        case LEFT_ARROW_CODE:
        case UP_ARROW_CODE:
          if (!isFirstTest()) {
            previousTest();
          }
          break;
        case RIGHT_ARROW_CODE:
        case DOWN_ARROW_CODE:
          if (!isLastTest()) {
            nextTest();
          }
          break;
        default:
          break;
      }
    } else {
      if (event.code !== SPACEBAR_CODE) {
        return;
      }
      const tag = (event.target as HTMLElement).tagName.toLowerCase();
      if (tag === "textarea" || tag === "input") {
        return;
      }
      event.preventDefault();
      if (startDisabled()) {
        return;
      }
      start();
    }
  };

  const start = () => {
    startTestSuiteRun();
  };

  const startDisabled = () => {
    return (
      keystore.type === "" ||
      keystore.status === ACTIVE ||
      testSuiteRun.started ||
      testSuiteRun.testRuns.length === 0
    );
  };

  const isFirstTest = () => {
    return testSuiteRun.currentTestRunIndex === 0;
  };

  const isLastTest = () => {
    return (
      testSuiteRun.currentTestRunIndex === testSuiteRun.testRuns.length - 1
    );
  };

  const previousTest = () => {
    if (testSuiteRun.currentTestRunIndex < 1) {
      return;
    }
    setCurrentTestRun(testSuiteRun.currentTestRunIndex - 1);
  };

  const nextTest = () => {
    if (testSuiteRun.currentTestRunIndex === testSuiteRun.testRuns.length - 1) {
      return;
    }
    setCurrentTestRun(testSuiteRun.currentTestRunIndex + 1);
  };

  const renderSetup = () => {
    return (
      <Grid container direction="column" spacing={3}>
        <Grid item>
          <Card>
            <CardHeader title="Choose Keystore" />
            <CardContent>
              <KeystorePicker />
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                mt={2}
              >
                <Button
                  variant="contained"
                  color="primary"
                  disabled={startDisabled()}
                  onClick={start}
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

  const renderBody = () => {
    if (testSuiteRun.started) {
      return (
        <Box>
          <TestRun
            isLastTest={isLastTest()}
            nextTest={nextTest}
            testRunIndex={testSuiteRun.currentTestRunIndex}
          />
          <Box mt={2}>
            <Grid container justifyContent="space-between">
              <Grid item>
                <Button
                  disabled={isFirstTest() || currentTestIsActive()}
                  onClick={previousTest}
                >
                  <ArrowBack /> &nbsp; Previous
                </Button>
              </Grid>
              <Grid item>
                <Button
                  disabled={isLastTest() || currentTestIsActive()}
                  onClick={nextTest}
                >
                  Next &nbsp; <ArrowForward />
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      );
    }
    return renderSetup();
  };

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
          {renderBody()}
        </Grid>
      </Grid>
    </Box>
  );
};

const mapStateToProps = (state: any) => {
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
