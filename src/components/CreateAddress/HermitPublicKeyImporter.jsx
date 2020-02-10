import React from 'react';
import PropTypes from 'prop-types';
import {
  HERMIT,
  ExportPublicKey,
} from "unchained-wallets";

// Components
import { FormGroup, FormHelperText} from '@material-ui/core';

import HermitReader from "../Hermit/HermitReader";

class HermitPublicKeyImporter extends React.Component {

  static propTypes =  {
    publicKeyImporter: PropTypes.shape({}).isRequired,
    validateAndSetPublicKey: PropTypes.func.isRequired,
    validateAndSetBIP32Path: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    resetBIP32Path: PropTypes.func.isRequired,
    enableChangeMethod: PropTypes.func.isRequired,
    disableChangeMethod: PropTypes.func.isRequired,
  };

  state = {
    publicKeyError: '',
  };

  componentDidMount = () => {
    const {resetBIP32Path} = this.props;
    resetBIP32Path();
  }

  interaction = () => {
    const {network, publicKeyImporter} = this.props;
    return ExportPublicKey({keystore: HERMIT, network, bip32Path: publicKeyImporter.bip32Path});
  }

  render = () => {
    const {disableChangeMethod} = this.props;
    const {publicKeyError} = this.state;
    return (
      <FormGroup>
        <HermitReader
          startText="Import Public Key"
          interaction={this.interaction()}
          onStart={disableChangeMethod}
          onSuccess={this.import}
          onClear={this.onClear} />
        <FormHelperText error>{publicKeyError}</FormHelperText>
      </FormGroup>
    );
  }

  setError = (value) => {
    this.setState({publicKeyError: value});
  }

  import = (data) => {
    const { validateAndSetBIP32Path, validateAndSetPublicKey, enableChangeMethod } = this.props;
    enableChangeMethod();
    const {pubkey, bip32_path} = data;
    validateAndSetBIP32Path(
      bip32_path,
      () => {
        validateAndSetPublicKey(pubkey, this.setError);
      },
      this.setError
    );
  }

  onClear = () => {
    const { reset, enableChangeMethod } = this.props;
    reset(true);		// clear BIP32 path
    this.setError('');
    enableChangeMethod();
  }

}

export default HermitPublicKeyImporter;
