import React from "react";
import PropTypes from "prop-types";
import { PENDING, HermitExportExtendedPublicKey } from "unchained-wallets";

// Components
import { FormGroup, FormHelperText } from "@material-ui/core";

import HermitReader from "../Hermit/HermitReader";

class HermitExtendedPublicKeyImporter extends React.Component {
  static propTypes = {
    extendedPublicKeyImporter: PropTypes.shape({}).isRequired,
    validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
    validateAndSetBIP32Path: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    resetBIP32Path: PropTypes.func.isRequired,
    enableChangeMethod: PropTypes.func.isRequired,
    disableChangeMethod: PropTypes.func.isRequired,
  };

  state = {
    extendedPublicKeyError: "",
    walletState: PENDING,
  };

  componentDidMount = () => {
    const { resetBIP32Path } = this.props;
    resetBIP32Path();
  };

  interaction = () => {
    const { network, extendedPublicKeyImporter } = this.props;
    return new HermitExportExtendedPublicKey({
      network,
      bip32Path: extendedPublicKeyImporter.bip32Path,
    });
  };

  render = () => {
    const { disableChangeMethod } = this.props;
    const { extendedPublicKeyError } = this.state;
    return (
      <FormGroup>
        <HermitReader
          startText="Import Extended Public Key"
          interaction={this.interaction()}
          onStart={disableChangeMethod}
          onSuccess={this.import}
          onClear={this.onClear}
        />
        <FormHelperText className="text-danger">
          {extendedPublicKeyError}
        </FormHelperText>
      </FormGroup>
    );
  };

  setError = (value) => {
    this.setState({ error: value });
  };

  import = (data) => {
    const {
      validateAndSetBIP32Path,
      validateAndSetExtendedPublicKey,
      enableChangeMethod,
    } = this.props;
    enableChangeMethod();
    const { xpub, bip32_path } = data;
    validateAndSetBIP32Path(
      bip32_path,
      () => {
        validateAndSetExtendedPublicKey(xpub, this.setError);
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

export default HermitExtendedPublicKeyImporter;
