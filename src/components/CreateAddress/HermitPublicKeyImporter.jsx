import React from "react";
import PropTypes from "prop-types";
import { HERMIT, ExportPublicKey } from "unchained-wallets";
import { validateBIP32Path } from "unchained-bitcoin";

// Components
import { FormGroup, FormHelperText } from "@mui/material";

import HermitReader from "../Hermit/HermitReader";

class HermitPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      publicKeyError: "",
    };
  }

  interaction = () => {
    const { network, defaultBIP32Path } = this.props;
    return ExportPublicKey({
      keystore: HERMIT,
      network,
      bip32Path: defaultBIP32Path,
    });
  };

  render = () => {
    const { publicKeyError } = this.state;
    return (
      <FormGroup>
        <HermitReader
          startText="Import Public Key"
          interaction={this.interaction()}
          onStart={this.handleReaderStart}
          onSuccess={this.handleReaderSuccess}
          onClear={this.handleReaderClear}
        />
        <FormHelperText error>{publicKeyError}</FormHelperText>
      </FormGroup>
    );
  };

  setError = (value) => {
    this.setState({ publicKeyError: value });
  };

  handleReaderStart = () => {
    const { disableChangeMethod } = this.props;
    disableChangeMethod();
  };

  handleReaderSuccess = (data) => {
    const { validatePublicKey, onImport, enableChangeMethod } = this.props;
    const { pubkey: nextPublicKey, bip32Path: nextBIP32Path } = data;

    enableChangeMethod();

    const bip32PathError = validateBIP32Path(nextBIP32Path);
    if (bip32PathError) {
      this.setError(bip32PathError);
      return;
    }

    const publicKeyError = validatePublicKey(nextPublicKey);
    if (publicKeyError) {
      this.setError(publicKeyError);
      return;
    }

    onImport({ publicKey: nextPublicKey, bip32Path: nextBIP32Path });
  };

  handleReaderClear = () => {
    const { enableChangeMethod } = this.props;
    this.setError("");
    enableChangeMethod();
  };
}

HermitPublicKeyImporter.propTypes = {
  network: PropTypes.string.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  validatePublicKey: PropTypes.func.isRequired,
  enableChangeMethod: PropTypes.func.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
};

export default HermitPublicKeyImporter;
