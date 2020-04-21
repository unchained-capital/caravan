import React from "react";
import PropTypes from "prop-types";
import { HermitExportExtendedPublicKey } from "unchained-wallets";

// Components
import { FormGroup, FormHelperText } from "@material-ui/core";

import HermitReader from "../Hermit/HermitReader";

class HermitExtendedPublicKeyImporter extends React.Component {
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
    this.setState({ extendedPublicKeyError: value });
  };

  import = (data) => {
    const {
      validateAndSetBIP32Path,
      validateAndSetExtendedPublicKey,
      enableChangeMethod,
    } = this.props;
    enableChangeMethod();
    const { xpub, bip32Path } = data;
    validateAndSetBIP32Path(
      bip32Path,
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

HermitExtendedPublicKeyImporter.propTypes = {
  enableChangeMethod: PropTypes.func.isRequired,
  extendedPublicKeyImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
  }).isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
  network: PropTypes.string.isRequired,
  reset: PropTypes.func.isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
};

export default HermitExtendedPublicKeyImporter;
