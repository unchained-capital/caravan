import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import {
  PENDING,
  ACTIVE,
  HERMIT,
  COLDCARD,
  INDIRECT_KEYSTORES,
} from "unchained-wallets";
import {
  Box,
  Typography,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
} from "@mui/material";
import {
  ThumbUp as SuccessIcon,
  ThumbDown as FailureIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";
import moment from "moment";
import Test from "../../tests/Test";
import * as testRunActions from "../../actions/testRunActions";
import * as errorNotificationActions from "../../actions/errorNotificationActions";
import InteractionMessages from "../InteractionMessages";
import { TestRunNote } from "./Note";
import { HermitReader, HermitDisplayer } from "../Hermit";
import {
  ColdcardJSONReader,
  ColdcardPSBTReader,
  ColdcardSigningButtons,
} from "../Coldcard";
import "./TestRun.css";
import { downloadFile } from "../../utils";

const SPACEBAR_CODE = 32;

class TestRunBase extends React.Component {
  componentDidMount = () => {
    document.addEventListener("keydown", this.handleKeyDown);
  };

  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.handleKeyDown);
  };

  handleKeyDown = (event) => {
    const { status, isLastTest, nextTest } = this.props;
    if (event.keyCode !== SPACEBAR_CODE) {
      return;
    }
    if (event.target.tagName.toLowerCase() === "textarea") {
      return;
    }
    event.preventDefault();
    if (status === ACTIVE) {
      return;
    }
    if (status === PENDING) {
      this.start();
    } else if (!isLastTest) {
      nextTest();
    }
  };

  handleDownloadPSBTClick = () => {
    const { test } = this.props;
    const interaction = test.interaction();
    const nameBits = test.name().split(" ");
    const body = interaction.request();
    const timestamp = moment().format("HHmm");
    const filename = `${timestamp}-${nameBits[2]}-${nameBits[1][0]}.psbt`;
    downloadFile(body, filename);
  };

  handledDownloadWalletConfigClick = () => {
    const { test } = this.props;
    const nameBits = test.name().split(" ");
    const name = `${nameBits[2].toLowerCase()}-${nameBits[1][0]}`;
    // FIXME - need to know firmware version and then set P2WSH-P2SH vs P2SH-P2WSH appropriately
    //   leaving it as P2WSH-P2SH for now.
    let output = `# Coldcard Multisig setup file for test suite
#
Name: ${name}
Policy: 2 of 2
Format: ${test.params.format.includes("-") ? "P2WSH-P2SH" : test.params.format}
Derivation: ${test.params.derivation}

`;
    // We need to loop over xpubs and output `xfp: xpub` for each
    const xpubs = test.params.extendedPublicKeys.map(
      (xpub) => `${xpub.rootFingerprint}: ${xpub.base58String}`
    );
    output += xpubs.join("\r\n");
    output += "\r\n";
    const filename = `wc-${name}.txt`;
    downloadFile(output, filename);
  };

  render = () => {
    const { test, testRunIndex, status, keystore } = this.props;
    if (!test) {
      return (
        <Box>
          <p>No test selected.</p>
        </Box>
      );
    }
    return (
      <Box>
        <Card>
          <CardHeader
            title={test.name()}
            subheader={`Test ${testRunIndex + 1}`}
          />
          <CardContent>
            {test.description()}
            {keystore.type === COLDCARD && !test.unsignedTransaction && (
              <Box align="center">
                <ColdcardJSONReader
                  interaction={test.interaction()}
                  onReceive={this.startParse}
                  onStart={this.start}
                  setError={this.reset}
                  isTest
                />
              </Box>
            )}
            {keystore.type === COLDCARD && test.unsignedTransaction && (
              <Box align="center" style={{ marginTop: "2em" }}>
                <ColdcardSigningButtons
                  handlePSBTDownloadClick={this.handleDownloadPSBTClick}
                  handleWalletConfigDownloadClick={
                    this.handledDownloadWalletConfigClick
                  }
                />
                <ColdcardPSBTReader
                  interaction={test.interaction()}
                  onReceivePSBT={this.startParse}
                  onStart={this.start}
                  setError={this.reset}
                  fileType="PSBT"
                  validFileFormats=".psbt"
                />
              </Box>
            )}
            {this.renderInteractionMessages()}
            {status === PENDING &&
              !Object.values(INDIRECT_KEYSTORES).includes(keystore.type) && (
                <Box align="center">
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={this.start}
                  >
                    Start Test
                  </Button>
                </Box>
              )}
            {keystore.type === HERMIT &&
              test.interaction().workflow[0] === "request" &&
              status === PENDING && (
                <Box align="center">
                  <HermitDisplayer
                    width={400}
                    parts={test.interaction().request()}
                  />
                </Box>
              )}
            {keystore.type === HERMIT && !this.testComplete() && (
              <Box>
                <HermitReader
                  onStart={this.start}
                  onSuccess={this.resolve}
                  onClear={this.reset}
                  startText="Scan QR Codes From Hermit"
                  interaction={test.interaction()}
                />
              </Box>
            )}
            {this.testComplete() && this.renderResult()}

            <TestRunNote />
          </CardContent>
          <CardActions>
            {status === ACTIVE && (
              <Button disabled>
                <CircularProgress />
                &nbsp; Running test...
              </Button>
            )}
            {this.testComplete() && (
              <Button variant="text" color="error" onClick={this.reset}>
                Reset Test
              </Button>
            )}
          </CardActions>
        </Card>
      </Box>
    );
  };

  testComplete = () => {
    const { status } = this.props;
    return (
      status === Test.SUCCESS ||
      status === Test.ERROR ||
      status === Test.FAILURE
    );
  };

  renderInteractionMessages = () => {
    const { status, test } = this.props;
    if (status === PENDING || status === ACTIVE) {
      return (
        <InteractionMessages
          excludeCodes={["hermit.command"]}
          messages={test.interaction().messagesFor({ state: status })}
        />
      );
    }
    return null;
  };

  renderResult = () => {
    const { status, message } = this.props;
    switch (status) {
      case Test.SUCCESS:
        return (
          <Box mt={2} align="center">
            <Typography variant="h5" className="TestRun-success">
              <SuccessIcon />
              &nbsp; Test passed
            </Typography>
          </Box>
        );
      case Test.FAILURE:
        return (
          <Box mt={2}>
            <Box align="center">
              <Typography variant="h5" className="TestRun-failure">
                <FailureIcon />
                &nbsp; Test failed
              </Typography>
            </Box>
            {message}
          </Box>
        );
      case Test.ERROR:
        return (
          <Box mt={2}>
            <Box align="center">
              <Typography variant="h5" className="TestRun-error">
                <ErrorIcon />
                &nbsp; Test error
              </Typography>
            </Box>
            {message}
          </Box>
        );
      default:
        return null;
    }
  };

  start = async () => {
    const { test, keystore, testRunIndex, startTestRun } = this.props;
    startTestRun(testRunIndex);
    if (keystore.type === HERMIT) {
      return;
    }
    const result = await test.run();
    this.handleResult(result);
  };

  startParse = async (data) => {
    const { test, testRunIndex, startTestRun } = this.props;
    startTestRun(testRunIndex);
    const result = await test.runParse(data);
    this.handleResult(result);
  };

  resolve = (actual) => {
    const { test } = this.props;
    const result = test.resolve(test.postprocess(actual));
    this.handleResult(result);
  };

  handleResult = (result) => {
    const { testRunIndex, endTestRun, setErrorNotification } = this.props;
    if (result.status === Test.ERROR) {
      setErrorNotification(result.message);
    }
    endTestRun(testRunIndex, result.status, this.formatMessage(result));
  };

  reset = () => {
    const { testRunIndex, resetTestRun } = this.props;
    resetTestRun(testRunIndex);
  };

  formatMessage = (result) => {
    switch (result.status) {
      case Test.FAILURE:
        return (
          <Box>
            <dl>
              <dt>Expected:</dt>
              <dd>
                <code className="TestRun-wrap">
                  {this.formatOutput(result.expected)}
                </code>
              </dd>
              <dt>Actual:</dt>
              <dd>
                <code className="TestRun-wrap">
                  {this.formatOutput(result.actual)}
                </code>
              </dd>
              {result.diff && (
                <div>
                  <dt>Diff:</dt>
                  <dd>
                    <code className="TestRun-wrap">
                      {result.diff.map(this.formatDiffSegment)}
                    </code>
                  </dd>
                </div>
              )}
            </dl>
          </Box>
        );
      case Test.ERROR:
        return <code>{result.message}</code>;
      default:
        return "";
    }
  };

  formatOutput = (output) => {
    switch (typeof output) {
      case "object":
        return JSON.stringify(output);
      case "string":
      case "number":
        return output;
      default:
        return "Did not recognize output type";
    }
  };

  formatDiffSegment = (segment, i) => {
    return (
      <span
        key={i}
        className={`TestRun-diff-segment-${this.diffSegmentClass(segment)}`}
      >
        {segment.value}
      </span>
    );
  };

  diffSegmentClass = (segment) => {
    if (segment.added) {
      return "added";
    }
    if (segment.removed) {
      return "removed";
    }
    return "common";
  };
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...{ keystore: state.keystore },
    ...(state.testSuiteRun.testRuns[ownProps.testRunIndex] || {}),
    ...{ testRunIndex: ownProps.testRunIndex },
  };
};

const mapDispatchToProps = {
  ...testRunActions,
  ...errorNotificationActions,
};

const TestRun = connect(mapStateToProps, mapDispatchToProps)(TestRunBase);

TestRunBase.propTypes = {
  endTestRun: PropTypes.func.isRequired,
  isLastTest: PropTypes.bool.isRequired,
  keystore: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }).isRequired,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.shape({})])
    .isRequired,
  nextTest: PropTypes.func.isRequired,
  resetTestRun: PropTypes.func.isRequired,
  testRunIndex: PropTypes.number.isRequired,
  test: PropTypes.shape({
    name: PropTypes.func.isRequired,
    description: PropTypes.func.isRequired,
    interaction: PropTypes.func.isRequired,
    params: PropTypes.shape({
      format: PropTypes.string,
      derivation: PropTypes.string,
      extendedPublicKeys: PropTypes.array,
    }),
    run: PropTypes.func.isRequired,
    runParse: PropTypes.func.isRequired,
    resolve: PropTypes.func.isRequired,
    postprocess: PropTypes.func.isRequired,
    unsignedTransaction: PropTypes.func,
  }),
  setErrorNotification: PropTypes.func.isRequired,
  startTestRun: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
};

TestRunBase.defaultProps = {
  test: {
    unsignedTransaction: null,
    params: {},
  },
};

export default TestRun;
