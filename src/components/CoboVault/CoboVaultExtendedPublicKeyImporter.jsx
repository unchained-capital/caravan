import React from "react";
import PropTypes from "prop-types";
import { CoboVaultExportExtendedPublicKey } from "unchained-wallets";

// Components
import { FormGroup, FormHelperText } from "@material-ui/core";

import { CoboVaultReader } from "./index";

class CoboVaultExtendedPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      extendedPublicKeyError: "",
    };
  }

  componentDidMount = () => {
    const { resetBIP32Path } = this.props;
    resetBIP32Path();
  };

  interaction = () => {
    const { network, extendedPublicKeyImporter } = this.props;
    return new CoboVaultExportExtendedPublicKey({
      network,
      bip32Path: extendedPublicKeyImporter.bip32Path,
    });
  };

  render = () => {
    const { disableChangeMethod } = this.props;
    const { extendedPublicKeyError } = this.state;
    return (
      <FormGroup>
        <CoboVaultReader
          qrStartText="Import Extended Public Key"
          fileStartText="Upload Extended Public Key"
          interaction={this.interaction()}
          onStart={disableChangeMethod}
          onSuccess={this.import}
          onClear={this.onClear}
          shouldShowFileReader
          fileType="json"
        />
        <FormHelperText className="text-danger">
          {extendedPublicKeyError}
        </FormHelperText>
      </FormGroup>
    );
  };

  setError = (value) => {
    this.setState({ extendedPublicKeyError: value });
  };

  import = (data) => {
    const {
      validateAndSetBIP32Path,
      validateAndSetExtendedPublicKey,
      enableChangeMethod,
      validateAndSetRootFingerprint,
    } = this.props;
    enableChangeMethod();
    const { xpub, bip32Path, rootFingerprint: fingerprint } = data;
    validateAndSetBIP32Path(
      bip32Path,
      () => {
        validateAndSetExtendedPublicKey(xpub, this.setError, () => {
          validateAndSetRootFingerprint(fingerprint);
        });
      },
      this.setError
    );
  };

  onClear = () => {
    const { reset, enableChangeMethod } = this.props;
    reset(true); // clear BIP32 path
    this.setError("");
    enableChangeMethod();
  };
}

CoboVaultExtendedPublicKeyImporter.propTypes = {
  enableChangeMethod: PropTypes.func.isRequired,
  extendedPublicKeyImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
  }).isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  network: PropTypes.string.isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
  validateAndSetRootFingerprint: PropTypes.func.isRequired,
};

export default CoboVaultExtendedPublicKeyImporter;
