import React, { Component } from "react";
import PropTypes from "prop-types";
import { PENDING, ACTIVE, BCURDecoder } from "unchained-wallets";
import { QrReader } from "react-qr-reader";
import {
  Grid,
  Button,
  Box,
  FormHelperText,
  LinearProgress,
} from "@mui/material";
import Copyable from "../Copyable";

const QR_CODE_READER_DELAY = 300; // ms?

class HermitReader extends Component {
  constructor(props) {
    super(props);
    this.decoder = new BCURDecoder(); // FIXME do we need useMemo ?
    this.state = {
      status: PENDING,
      error: "",
      totalParts: 0,
      partsReceived: 0,
      percentageReceived: 0,
    };
  }

  render = () => {
    const { status, error, percentageReceived, partsReceived, totalParts } =
      this.state;
    const { interaction, width, startText } = this.props;

    if (status === PENDING) {
      const commandMessage = interaction.messageFor({
        state: status,
        code: "hermit.command",
      });
      return (
        <div>
          <p>{commandMessage.instructions}</p>
          <Grid container justifyContent="center" className="mb-2">
            <Copyable text={commandMessage.command} showText={false}>
              <code>
                <strong>{commandMessage.mode}&gt;</strong>{" "}
                {commandMessage.command}
              </code>
            </Copyable>
          </Grid>
          <p>When you are ready, scan the QR codes produced by Hermit.</p>
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              className="mt-2"
              size="large"
              onClick={this.handleStart}
            >
              {startText}
            </Button>
          </Box>
        </div>
      );
    }

    if (status === ACTIVE) {
      return (
        <div style={{ padding: "3rem" }}>
          <Grid container direction="column">
            <Grid item>
              <QrReader
                delay={QR_CODE_READER_DELAY}
                onError={this.handleError}
                onScan={this.handleScan}
                style={{ width }}
                facingMode="user"
              />
            </Grid>
            {percentageReceived === 0 ? (
              <Grid item style={{ width }}>
                <LinearProgress />
                <p>Waiting for first QR code...</p>
              </Grid>
            ) : (
              <Grid item style={{ width }}>
                <LinearProgress
                  variant="determinate"
                  value={percentageReceived}
                />
                <p>
                  Scanned {partsReceived} of {totalParts} QR codes...
                </p>
              </Grid>
            )}

            <Grid item>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={this.handleStop}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </div>
      );
    }

    if (status === "error" || status === "success") {
      return (
        <div>
          <FormHelperText error>{error}</FormHelperText>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={this.handleStop}
          >
            Reset
          </Button>
        </div>
      );
    }

    return null;
  };

  handleStart = () => {
    const { onStart } = this.props;
    this.setState({ status: ACTIVE, error: "" });
    if (onStart) {
      onStart();
    }
  };

  handleError = (error) => {
    const { onClear } = this.props;
    this.setState({ status: "error", error: error.message });
    if (onClear) {
      onClear();
    }
  };

  handleScan = (qrCodeString) => {
    const { onSuccess } = this.props;
    if (qrCodeString) {
      this.decoder.receivePart(qrCodeString);
      const progress = this.decoder.progress();
      const newPercentageReceived =
        progress.totalParts > 0
          ? (progress.partsReceived / progress.totalParts) * 100
          : 0;
      this.setState({
        partsReceived: progress.partsReceived,
        totalParts: progress.totalParts,
        percentageReceived: newPercentageReceived,
      });

      if (this.decoder.isComplete()) {
        if (this.decoder.isSuccess()) {
          const data = this.decoder.data();
          onSuccess(data);
        } else {
          const errorMessage = this.decoder.errorMessage();
          this.setState({ status: "error", error: errorMessage });
        }
      }
    }
  };

  handleStop = () => {
    const { onClear } = this.props;
    this.setState({
      status: PENDING,
      error: "",
      totalParts: 0,
      partsReceived: 0,
      percentageReceived: 0,
    });
    if (onClear) {
      this.decoder.reset();
      onClear();
    }
  };
}

HermitReader.propTypes = {
  onStart: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  width: PropTypes.string,
  startText: PropTypes.string,
  interaction: PropTypes.shape({
    messageFor: PropTypes.func,
    parse: PropTypes.func,
  }).isRequired,
};

HermitReader.defaultProps = {
  width: "256px",
  startText: "Scan",
};

export default HermitReader;
