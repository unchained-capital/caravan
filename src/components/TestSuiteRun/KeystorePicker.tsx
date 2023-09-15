import React from "react";
import { connect } from "react-redux";

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
  MenuItem,
  TextField,
  Button,
} from "@mui/material";
import * as keystoreActions from "../../actions/keystoreActions";
import { setErrorNotification as setErrorNotificationAction } from "../../actions/errorNotificationActions";

import { KeystoreNote } from "./Note";
import InteractionMessages from "../InteractionMessages";

const NO_VERSION_DETECTION = ["", ...Object.values(INDIRECT_KEYSTORES)];

interface KeystorePickerBaseProps {
  setErrorNotification: (message: string) => void;
  setKeystore: (type: string, version: string) => void;
  setKeystoreStatus: (status: string) => void;
  status: string;
  type: string;
  version: string;
}

const KeystorePickerBase = ({
  type,
  status,
  version,
  setErrorNotification,
  setKeystoreStatus,
  setKeystore,
}: KeystorePickerBaseProps) => {
  const detectVersion = async () => {
    setKeystoreStatus(ACTIVE);
    try {
      const result = await interaction().run();
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

  const interaction = () => {
    return GetMetadata({ keystore: type });
  };

  const handleTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newType = event.target.value;
    setKeystore(newType, version);
  };

  const handleVersionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVersion = event.target.value;
    setKeystore(type, newVersion);
  };

  return (
    <Box>
      <Grid container spacing={2} justifyContent="center">
        <Grid item md={4}>
          <FormControl fullWidth>
            <TextField
              label="Type"
              id="keystore-select"
              value={type}
              onChange={handleTypeChange}
              select
              variant="standard"
            >
              <MenuItem value="">{"< Select type >"}</MenuItem>
              <MenuItem value={TREZOR}>Trezor</MenuItem>
              <MenuItem value={LEDGER}>Ledger</MenuItem>
              <MenuItem value={COLDCARD}>Coldcard</MenuItem>
              <MenuItem value={HERMIT}>Hermit</MenuItem>
            </TextField>
          </FormControl>
        </Grid>

        <Grid item md={6}>
          <TextField
            name="version"
            fullWidth
            label="Version"
            value={version}
            variant="standard"
            disabled={type === ""}
            onChange={handleVersionChange}
          />
        </Grid>

        <Grid item md={2}>
          <Button
            disabled={status === ACTIVE || NO_VERSION_DETECTION.includes(type)}
            onClick={detectVersion}
          >
            {status === ACTIVE ? "Detecting..." : "Detect"}
          </Button>
        </Grid>
      </Grid>

      {type && !NO_VERSION_DETECTION.includes(type) && (
        <InteractionMessages
          messages={interaction().messagesFor({ state: status })}
        />
      )}

      <KeystoreNote />
    </Box>
  );
};

const mapStateToProps = (state: { keystore: KeystorePickerBaseProps }) => {
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
