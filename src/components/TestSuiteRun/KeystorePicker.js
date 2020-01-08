import React from 'react';
import {connect} from "react-redux";
import {
  TREZOR,
  LEDGER,
  HERMIT,
  PENDING,
  ACTIVE,
  GetMetadata,
} from "unchained-wallets";

import {
  setKeystore,
  setKeystoreStatus,
} from "../../actions/keystoreActions";
import {
  setErrorNotification,
} from "../../actions/errorNotificationActions";

import {
  Box, Grid, Typography,
  FormControl, InputLabel, Select, MenuItem,
  TextField, 
  Button,
} from '@material-ui/core';
import {KeystoreNote} from "./Note";
import InteractionMessages from "../InteractionMessages";

class KeystorePickerBase extends React.Component {

  render() {
    const {type, status, version} = this.props;
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
                <MenuItem value="">{'< Select type >'}</MenuItem>
                <MenuItem value={TREZOR}>Trezor</MenuItem>
                <MenuItem value={LEDGER}>Ledger</MenuItem>
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
              disabled={type === ''}
              onChange={this.handleVersionChange}
            />
          </Grid>
          
          <Grid item md={2}>
            <Button disabled={status === ACTIVE || type === '' || type === HERMIT} onClick={this.detectVersion}>{status === ACTIVE ? "Detecting..." : "Detect"}</Button>
          </Grid>
          
        </Grid>
        
        {type && type !== HERMIT && <InteractionMessages messages={this.interaction().messagesFor({state: status})} />}
        
        <KeystoreNote />

      </Box>
    );
  }

  handleTypeChange = (event) => {
    const {version, setKeystore} = this.props;
    const newType = event.target.value;
    setKeystore(newType, version);
  }

  handleVersionChange = (event) => {
    const {type, setKeystore} = this.props;
    const newVersion = event.target.value;
    setKeystore(type, newVersion);
  }

  interaction = () => {
    const {type} = this.props;
    return GetMetadata({keystore: type});
  }

  detectVersion = async () => {
    const {type, setKeystore, setKeystoreStatus, setErrorNotification} = this.props;
    setKeystoreStatus(ACTIVE);
    try {
      const result = await this.interaction().run();
      if (result) {
        setKeystore(type, result.spec);
      }
    } catch(e) {
      console.error(e);
      setErrorNotification(e.message);
    }
    setKeystoreStatus(PENDING);
  }
  
}

const mapStateToProps = (state) => {
  return {
    ...state.keystore,
  };
};

const mapDispatchToProps = {
  setKeystore,
  setKeystoreStatus,
  setErrorNotification,
};

const KeystorePicker = connect(mapStateToProps, mapDispatchToProps)(KeystorePickerBase);

export {KeystorePicker}
