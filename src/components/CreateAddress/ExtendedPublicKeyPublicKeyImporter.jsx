import React from 'react';
import PropTypes from 'prop-types';
import {
  convertAndValidateExtendedPublicKey,
  deriveChildPublicKey,
} from "unchained-bitcoin";

// Components
import {  Button, TextField, FormHelperText, Box, Grid } from '@material-ui/core';


const DEFAULT_BIP32_PATH = "m/0";

class ExtendedPublicKeyPublicKeyImporter extends React.Component {

  static propTypes =  {
    network: PropTypes.string.isRequired,
    publicKeyImporter: PropTypes.shape({}).isRequired,
    validateAndSetPublicKey: PropTypes.func.isRequired,
    validateAndSetBIP32Path: PropTypes.func.isRequired,
  };

  componentDidMount = () => {
    this.setBIP32PathToDefault();
  }

  state = {
    extendedPublicKey: '',
    extendedPublicKeyError: '',
    bip32PathError: '',
    conversionMessage: "",
  };

  render = () => {
    const {publicKeyImporter} = this.props;
    const {extendedPublicKey, extendedPublicKeyError, bip32PathError, conversionMessage} = this.state;
    return (
      <div>
        <Box mt={2}>
          <TextField
            fullWidth
            name="extendedPublicKey"
            label="Extended Public Key"
            value={extendedPublicKey}
            onChange={this.handleExtendedPublicKeyChange}
            error={this.hasExtendedPublicKeyError()}
            helperText={extendedPublicKeyError}
          />
        </Box>
        {conversionMessage !== "" &&
        <Box mb={2}>
          <FormHelperText>{conversionMessage}, this may indicate an invalid network setting, if so correct setting, remove key and try again.</FormHelperText>
        </Box>}

          <Box mt={2}>
            <Grid container>
              <Grid item md={10}>
                  <TextField
                    fullWidth
                    name="bip32Path"
                    label="BIP32 Path (relative to xpub)"
                    type="text"
                    value={publicKeyImporter.bip32Path}
                    onChange={this.handleBIP32PathChange}
                    error={this.hasBIP32PathError()}
                    helperText={bip32PathError}
                  />
              <FormHelperText>Use the default value if you don&rsquo;t understand BIP32 paths.</FormHelperText>
            </Grid>
            <Grid item md={2}>
              {! this.bip32PathIsDefault() && <Button type="button" variant="contained" size="small"  onClick={this.resetBIP32Path}>Default</Button>}
            </Grid>
          </Grid>
          <Box mt={2}>
            <Button type="button" variant="contained" color="primary" size="large" onClick={this.import} disabled={extendedPublicKey === '' || this.hasError()}>Import Public Key</Button>
          </Box>
        </Box>
      </div>
    );
  }

  import = () => {
    const {network, publicKeyImporter, validateAndSetPublicKey} = this.props;
    const {extendedPublicKey} = this.state;
    const publicKey = deriveChildPublicKey(extendedPublicKey, publicKeyImporter.bip32Path, network);
    validateAndSetPublicKey(publicKey, (bip32PathError) => this.setState({bip32PathError}));
  }

  setBIP32PathToDefault = () => {
    const {validateAndSetBIP32Path} = this.props;
    validateAndSetBIP32Path(DEFAULT_BIP32_PATH, () => {}, () => {});
  }

  hasBIP32PathError = () => {
    return this.state.bip32PathError !== '';
  }

  hasExtendedPublicKeyError = () => {
    return this.state.extendedPublicKeyError !== '';
  }

  hasError = () => (this.hasBIP32PathError() || this.hasExtendedPublicKeyError());

  setBIP32PathError = (value) => {
    this.setState({bip32PathError: value});
  }

  handleBIP32PathChange = (event) => {
    const { validateAndSetBIP32Path } = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(bip32Path, () => {}, this.setBIP32PathError, {mode: "unhardened"});
  };

  bip32PathIsDefault = () => {
    const {publicKeyImporter} = this.props;
    return publicKeyImporter.bip32Path === DEFAULT_BIP32_PATH;
  }

  resetBIP32Path = () => {
    this.setBIP32PathToDefault();
    this.setBIP32PathError('');
  }

  handleExtendedPublicKeyChange = (event) => {
    const {network} = this.props;
    const enteredExtendedPublicKey = event.target.value;
    const convertedPublicKey = convertAndValidateExtendedPublicKey(enteredExtendedPublicKey, network);
    const extendedPublicKeyError = convertedPublicKey.error;
    const extendedPublicKey = convertedPublicKey.extendedPublicKey;
    this.setState({extendedPublicKey, extendedPublicKeyError, conversionMessage: convertedPublicKey.message});
  };

}

export default ExtendedPublicKeyPublicKeyImporter;
