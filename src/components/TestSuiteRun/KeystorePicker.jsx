import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import {
  TREZOR,
  LEDGER,
  HERMIT,
  COLDCARD,
  PENDING,
  ACTIVE,
  INDIRECT_KEYSTORES,
  GetMetadata,
} from "unchained-wallets";

import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
} from "@material-ui/core";
import * as keystoreActions from "../../actions/keystoreActions";
import { setErrorNotification as setErrorNotificationAction } from "../../actions/errorNotificationActions";

import { KeystoreNote } from "./Note";
import InteractionMessages from "../InteractionMessages";

const NO_VERSION_DETECTION = ["", ...Object.values(INDIRECT_KEYSTORES)];

class KeystorePickerBase extends React.Component {
  detectVersion = async () => {
    const {
      type,
      setKeystore,
      setKeystoreStatus,
      setErrorNotification,
    } = this.props;
    setKeystoreStatus(ACTIVE);
    try {
      const result = await this.interaction().run();
      if (result) {
        setKeystore(type, result.spec);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setErrorNotification(e.message);
    }
    setKeystoreStatus(PENDING);
  };

  interaction = () => {
    const { type } = this.props;
    return GetMetadata({ keystore: type });
  };

  handleTypeChange = (event) => {
    const { version, setKeystore } = this.props;
    const newType = event.target.value;
    setKeystore(newType, version);
  };

  handleVersionChange = (event) => {
    const { type, setKeystore } = this.props;
    const newVersion = event.target.value;
    setKeystore(type, newVersion);
  };

  render() {
    const { type, status, version } = this.props;
    return (
      <Box>
        <Grid container spacing={2} justify="center">
          <Grid item md={4}>
            <FormControl fullWidth>
              <InputLabel id="keystore-select-label">Type</InputLabel>
              <Select
                labelId="keystore-select-label"
                id="keystore-select"
                value={type}
                onChange={this.handleTypeChange}
              >
                <MenuItem value="">{"< Select type >"}</MenuItem>
                <MenuItem value={TREZOR}>Trezor</MenuItem>
                <MenuItem value={LEDGER}>Ledger</MenuItem>
                <MenuItem value={COLDCARD}>Coldcard</MenuItem>
                <MenuItem value={HERMIT}>Hermit</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item md={6}>
            <TextField
              name="version"
              fullWidth
              label="Version"
              value={version}
              disabled={type === ""}
              onChange={this.handleVersionChange}
            />
          </Grid>

          <Grid item md={2}>
            <Button
              disabled={
                status === ACTIVE || NO_VERSION_DETECTION.includes(type)
              }
              onClick={this.detectVersion}
            >
              {status === ACTIVE ? "Detecting..." : "Detect"}
            </Button>
          </Grid>
        </Grid>

        {type && !NO_VERSION_DETECTION.includes(type) && (
          <InteractionMessages
            messages={this.interaction().messagesFor({ state: status })}
          />
        )}

        <KeystoreNote />
      </Box>
    );
  }
}

KeystorePickerBase.propTypes = {
  setErrorNotification: PropTypes.func.isRequired,
  setKeystore: PropTypes.func.isRequired,
  setKeystoreStatus: PropTypes.func.isRequired,
  status: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  version: PropTypes.string.isRequired,
};

const mapStateToProps = (state) => {
  return {
    ...state.keystore,
  };
};

const mapDispatchToProps = {
  ...keystoreActions,
  setErrorNotification: setErrorNotificationAction,
};

const KeystorePicker = connect(
  mapStateToProps,
  mapDispatchToProps
)(KeystorePickerBase);

export default KeystorePicker;
