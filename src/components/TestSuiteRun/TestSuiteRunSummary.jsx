import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import { connect } from "react-redux";
import Bowser from "bowser";
import {
  TREZOR,
  LEDGER,
  HERMIT,
  COLDCARD,
  PENDING,
  ACTIVE,
  VERSION as UNCHAINED_WALLETS_VERSION,
} from "unchained-wallets";

import {
  Grid,
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  ThumbUp as SuccessIcon,
  ThumbDown as FailureIcon,
  Error as ErrorIcon,
  Notes as NoteIcon,
  MoreHoriz as PendingIcon,
} from "@mui/icons-material";
import Test from "../../tests/Test";

import { setCurrentTestRun as setCurrentTestRunAction } from "../../actions/testSuiteRunActions";

import "./TestSuiteRunSummary.css";

class TestSuiteRunSummaryBase extends React.Component {
  render = () => {
    const { testSuiteRun, keystore } = this.props;
    const environment = Bowser.getParser(window.navigator.userAgent);
    return (
      <Grid container direction="column" spacing={3}>
        <Grid item>
          <Card>
            <CardHeader title="Summary" />
            <CardContent>
              <dl>
                <dt>OS:</dt>
                <dd>
                  {environment.getOSName()} {environment.getOSVersion()}
                </dd>
                <dt>Browser:</dt>
                <dd>
                  {environment.getBrowserName()}{" "}
                  {environment.getBrowserVersion()}
                </dd>
                <dt>unchained-wallets:</dt>
                <dd>
                  v.
                  {UNCHAINED_WALLETS_VERSION}
                </dd>
                {keystore.type && (
                  <Box>
                    <dt>Keystore:</dt>
                    <dd>
                      {this.keystoreName(keystore.type)} {keystore.version}
                    </dd>
                  </Box>
                )}
                {keystore.note && (
                  <Box>
                    <dt>Notes:</dt>
                    <dd>{keystore.note}</dd>
                  </Box>
                )}
              </dl>
            </CardContent>
          </Card>
        </Grid>

        <Grid item>
          <Card>
            <CardHeader
              title="Tests"
              subheader={`${testSuiteRun.testRuns.length} Total`}
            />
            <CardContent>{this.renderTests()}</CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  renderTests = () => {
    const { testSuiteRun, keystore } = this.props;
    if (keystore.type === "") {
      return <p>Choose a keystore type to generate a test suite...</p>;
    }
    return (
      <Box>
        <Typography variant="h6">
          <span className="TestSuiteRunSummary-success">
            {
              testSuiteRun.testRuns.filter(
                (testRun) => testRun.status === Test.SUCCESS
              ).length
            }{" "}
            <small>SUCCESS</small>
          </span>
          &nbsp; / &nbsp;
          <span className="TestSuiteRunSummary-failure">
            {
              testSuiteRun.testRuns.filter(
                (testRun) => testRun.status === Test.FAILURE
              ).length
            }{" "}
            <small>FAIL</small>
          </span>
          &nbsp; / &nbsp;
          <span className="TestSuiteRunSummary-error">
            {
              testSuiteRun.testRuns.filter(
                (testRun) => testRun.status === Test.ERROR
              ).length
            }{" "}
            <small>ERROR</small>
          </span>
        </Typography>

        <Divider />

        <List
          style={{ maxHeight: "200px", overflow: "auto" }}
          dense
          component="nav"
        >
          {testSuiteRun.testRuns.map(this.renderTestRun)}
        </List>
      </Box>
    );
  };

  renderTestRun = (testRun, i) => {
    const { testSuiteRun } = this.props;
    return (
      <ListItem
        selected={testSuiteRun.currentTestRunIndex === i}
        button
        key={i}
        onClick={this.testRunChooser(i)}
        disabled={!testSuiteRun.started}
      >
        {this.renderTestRunResult(testRun)}
        <ListItemText>
          {testRun.test.name()}
          {testRun.status !== PENDING && testRun.status !== ACTIVE && (
            <small>
              &nbsp; (
              {moment
                .duration(testRun.endedAt.diff(testRun.startedAt))
                .asSeconds()}
              s)
            </small>
          )}
        </ListItemText>
        {testRun.note && (
          <ListItemIcon>
            <Tooltip title={testRun.note}>
              <NoteIcon />
            </Tooltip>
          </ListItemIcon>
        )}
      </ListItem>
    );
  };

  renderTestRunResult = (testRun) => {
    switch (testRun.status) {
      case PENDING:
        return (
          <ListItemIcon>
            <PendingIcon className="TestSuiteRunSummary-pending" />
          </ListItemIcon>
        );
      case Test.SUCCESS:
        return (
          <ListItemIcon>
            <SuccessIcon className="TestSuiteRunSummary-success" />
          </ListItemIcon>
        );
      case Test.FAILURE:
        return (
          <ListItemIcon>
            <FailureIcon className="TestSuiteRunSummary-failure" />
          </ListItemIcon>
        );
      case Test.ERROR:
        return (
          <ListItemIcon>
            <ErrorIcon className="TestSuiteRunSummary-error" />
          </ListItemIcon>
        );
      case ACTIVE:
        return (
          <ListItemIcon>
            <CircularProgress className="TestSuiteRunSummary-active" />
          </ListItemIcon>
        );
      default:
        return null;
    }
  };

  testRunChooser = (testRunIndex) => {
    const { setCurrentTestRun } = this.props;
    return () => {
      setCurrentTestRun(testRunIndex);
    };
  };

  keystoreName = (type) => {
    switch (type) {
      case TREZOR:
        return "Trezor";
      case LEDGER:
        return "Ledger";
      case HERMIT:
        return "Hermit";
      case COLDCARD:
        return "Coldcard";
      default:
        return "";
    }
  };
}

TestSuiteRunSummaryBase.propTypes = {
  keystore: PropTypes.shape({
    note: PropTypes.string,
    type: PropTypes.string,
    version: PropTypes.string,
  }).isRequired,
  testSuiteRun: PropTypes.shape({
    currentTestRunIndex: PropTypes.number,
    started: PropTypes.bool,
    testRuns: PropTypes.arrayOf(PropTypes.shape({})),
  }).isRequired,
  setCurrentTestRun: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return {
    keystore: state.keystore,
    testSuiteRun: state.testSuiteRun,
  };
};

const mapDispatchToProps = {
  setCurrentTestRun: setCurrentTestRunAction,
};

const TestSuiteRunSummary = connect(
  mapStateToProps,
  mapDispatchToProps
)(TestSuiteRunSummaryBase);

export default TestSuiteRunSummary;
