import React from "react";
import PropTypes from "prop-types";
import {
  ERROR,
  ExportExtendedPublicKey,
  PENDING,
  UNSUPPORTED,
} from "unchained-wallets";
import { FormGroup, FormHelperText } from "@mui/material";
import InteractionMessages from "../InteractionMessages";

class IndirectExtendedPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: this.interaction().isSupported() ? PENDING : UNSUPPORTED,
      extendedPublicKeyError: "",
    };
  }

  // The extendedPublicKeyImporter has a "default" root multisig bip32path
  // which does not work on Coldcard, so the status will be UNSUPPORTED.
  // this gets updated almost immediately, so just fire off another isSupported()
  // to check if we're good.
  componentDidUpdate() {
    const { status } = this.state;
    if (status !== PENDING && this.interaction().isSupported()) {
      this.setState({ status: PENDING });
    }
  }

  interaction = () => {
    const { network, extendedPublicKeyImporter } = this.props;
    return new ExportExtendedPublicKey({
      keystore: extendedPublicKeyImporter.method,
      bip32Path: extendedPublicKeyImporter.bip32Path,
      network,
      includeXFP: true,
    });
  };

  render = () => {
    const {
      Reader,
      disableChangeMethod,
      resetBIP32Path,
      extendedPublicKeyImporter,
    } = this.props;
    const { status, extendedPublicKeyError } = this.state;
    return (
      <FormGroup>
        <Reader
          setError={this.setError}
          hasError={this.hasBIP32PathError()}
          errorMessage={this.bip32PathError()}
          bip32PathIsDefault={this.bip32PathIsDefault}
          handleBIP32PathChange={this.handleBIP32PathChange}
          resetBIP32Path={resetBIP32Path}
          onReceive={this.onReceive}
          interaction={this.interaction()}
          disableChangeMethod={disableChangeMethod}
          extendedPublicKeyImporter={extendedPublicKeyImporter}
        />
        <InteractionMessages
          messages={this.interaction().messagesFor({ state: status })}
          excludeCodes={["bip32"]}
        />
        <FormHelperText error>{extendedPublicKeyError}</FormHelperText>
      </FormGroup>
    );
  };

  hasBIP32PathError = () => {
    const { status } = this.state;
    return this.interaction().hasMessagesFor({
      state: status,
      level: ERROR,
      code: "bip32",
    });
  };

  bip32PathError = () => {
    const { status } = this.state;
    return this.interaction().messageTextFor({
      state: status,
      level: ERROR,
      code: "bip32",
    });
  };

  handleBIP32PathChange = (event) => {
    const { validateAndSetBIP32Path } = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(
      bip32Path,
      () => {},
      () => {}
    );
  };

  bip32PathIsDefault = () => {
    const { extendedPublicKeyImporter, defaultBIP32Path } = this.props;
    return extendedPublicKeyImporter.bip32Path === defaultBIP32Path;
  };

  resetBIP32Path = () => {
    const { resetBIP32Path } = this.props;
    resetBIP32Path();
  };

  setError = (value) => {
    this.setState({ extendedPublicKeyError: value });
  };

  onReceive = (data) => {
    const {
      validateAndSetBIP32Path,
      validateAndSetExtendedPublicKey,
      validateAndSetRootFingerprint,
      enableChangeMethod,
    } = this.props;
    if (enableChangeMethod) {
      enableChangeMethod();
    }
    try {
      const { xpub, bip32Path, rootFingerprint } =
        this.interaction().parse(data);
      validateAndSetRootFingerprint(rootFingerprint, this.setError);
      validateAndSetBIP32Path(
        bip32Path,
        () => {
          validateAndSetExtendedPublicKey(xpub, this.setError);
        },
        this.setError
      );
    } catch (e) {
      this.setError(e.message);
    }
  };
}

IndirectExtendedPublicKeyImporter.propTypes = {
  enableChangeMethod: PropTypes.func,
  extendedPublicKeyImporter: PropTypes.shape({
    method: PropTypes.string,
    bip32Path: PropTypes.string,
  }).isRequired,
  disableChangeMethod: PropTypes.func,
  network: PropTypes.string.isRequired,
  Reader: PropTypes.func.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
  validateAndSetRootFingerprint: PropTypes.func.isRequired,
};

IndirectExtendedPublicKeyImporter.defaultProps = {
  enableChangeMethod: null,
  disableChangeMethod: null,
};

export default IndirectExtendedPublicKeyImporter;
