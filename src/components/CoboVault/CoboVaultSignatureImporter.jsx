import React from "react";
import PropTypes from "prop-types";
import {
  PENDING,
  UNSUPPORTED,
  SignMultisigTransaction,
  COBOVAULT,
} from "unchained-wallets";

// Components
import { Grid, Box, FormHelperText } from "@material-ui/core";

import InteractionMessages from "../InteractionMessages";
import { CoboVaultDisplayer, CoboVaultReader } from "./index";

class CoboVaultSignatureImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bip32PathError: "",
      signatureError: "",
      status: this.interaction(true).isSupported() ? PENDING : UNSUPPORTED,
    };
  }

  interaction = () => {
    const { signatureImporter, network, inputs, outputs } = this.props;
    const bip32Paths = inputs.map((input) => {
      if (typeof input.bip32Path === "undefined")
        return signatureImporter.bip32Path; // pubkey path
      return `${signatureImporter.bip32Path}${input.bip32Path.slice(1)}`; // xpub/pubkey slice away the m, keep /
    });

    return SignMultisigTransaction({
      keystore: COBOVAULT,
      network,
      inputs,
      outputs,
      bip32Paths,
    });
  };

  render = () => {
    const { disableChangeMethod } = this.props;
    const { signatureError, status } = this.state;
    const interaction = this.interaction();
    if (status === UNSUPPORTED) {
      return (
        <InteractionMessages
          messages={interaction.messagesFor({ state: status })}
          excludeCodes={["cobovault.signature_request"]}
        />
      );
    }
    return (
      <Box mt={2}>
        <Box mt={2}>
          <Grid container>
            <Grid item>
              <CoboVaultDisplayer
                data={interaction.request()}
                startText="Show Transaction QRCode"
              />
            </Grid>
          </Grid>

          <CoboVaultReader
            qrStartText="Scan Signature QR Code"
            fileStartText="Upload Signed PSBT"
            interaction={interaction}
            onStart={disableChangeMethod}
            onSuccess={this.import}
            onClear={this.clear}
            showFileReader={false}
            shouldShowFileReader
          />

          <InteractionMessages
            messages={interaction.messagesFor({ state: status })}
            excludeCodes={["cobovault.signature_request"]}
          />

          <FormHelperText error>{signatureError}</FormHelperText>
        </Box>
      </Box>
    );
  };

  import = (signature) => {
    const { validateAndSetSignature, enableChangeMethod } = this.props;
    const signatures = Object.values(signature).reduce((acc, cur) => {
      return acc.concat(cur);
    }, []);
    this.setState({ signatureError: "" });
    enableChangeMethod();
    validateAndSetSignature(signatures, (signatureError) => {
      this.setState({ signatureError });
    });
  };

  clear = () => {
    const { resetBIP32Path, enableChangeMethod } = this.props;
    resetBIP32Path();
    this.setState({ signatureError: "" });
    enableChangeMethod();
  };

  hasBIP32PathError = () => {
    const { bip32PathError } = this.state;
    return bip32PathError !== "";
  };

  handleBIP32PathChange = (event) => {
    const { validateAndSetBIP32Path } = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(
      bip32Path,
      () => {},
      (bip32PathError) => {
        this.setState({ bip32PathError });
      }
    );
  };

  bip32PathIsDefault = () => {
    const { signatureImporter, defaultBIP32Path } = this.props;
    return signatureImporter.bip32Path === defaultBIP32Path;
  };
}

CoboVaultSignatureImporter.propTypes = {
  network: PropTypes.string.isRequired,
  inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  outputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  signatureImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
  }).isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetSignature: PropTypes.func.isRequired,
  enableChangeMethod: PropTypes.func.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
};

export default CoboVaultSignatureImporter;
