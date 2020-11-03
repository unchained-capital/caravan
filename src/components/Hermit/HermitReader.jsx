import React, { Component } from "react";
import PropTypes from "prop-types";
import { PENDING, ACTIVE } from "unchained-wallets";
import QrReader from "react-qr-reader";
import { Grid, Button, Box, FormHelperText } from "@material-ui/core";
import Copyable from "../Copyable";

const QR_CODE_READER_DELAY = 300; // ms?

class HermitReader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      status: PENDING,
      error: "",
    };
  }

  render = () => {
    const { status, error } = this.state;
    const { interaction, width, startText } = this.props;

    if (status === PENDING) {
      const commandMessage = interaction.messageFor({
        state: status,
        code: "hermit.command",
      });
      return (
        <div>
          <p>{commandMessage.instructions}</p>
          <Grid container justify="center" className="mb-2">
            <Copyable text={commandMessage.command} showText={false}>
              <code>
                <strong>{commandMessage.mode}&gt;</strong>{" "}
                {commandMessage.command}
              </code>
            </Copyable>
          </Grid>
          <p>When you are ready, scan the QR code produced by Hermit:</p>
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

  handleScan = (data) => {
    const { onSuccess, interaction } = this.props;
    if (data) {
      try {
        const result = interaction.parse(data);
        onSuccess(result);
        this.setState({ status: "success" });
      } catch (e) {
        this.handleError(e);
      }
    }
  };

  handleStop = () => {
    const { onClear } = this.props;
    this.setState({
      status: PENDING,
      error: "",
    });
    if (onClear) {
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
