import React from "react";
import PropTypes from "prop-types";
import {
  UNSUPPORTED,
  PENDING,
  ACTIVE,
  ERROR,
  ExportPublicKey,
} from "unchained-wallets";

// Components
import {
  Button,
  TextField,
  FormHelperText,
  Box,
  Grid,
} from "@material-ui/core";

import InteractionMessages from "../InteractionMessages";

class HardwareWalletPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      publicKeyError: "",
      bip32PathError: "",
      status: this.interaction().isSupported() ? PENDING : UNSUPPORTED,
    };
  }

  componentDidMount = () => {
    this.resetBIP32Path();
  };

  interaction = () => {
    const { network, publicKeyImporter } = this.props;
    return ExportPublicKey({
      network,
      keystore: publicKeyImporter.method,
      bip32Path: publicKeyImporter.bip32Path,
    });
  };

  render = () => {
    const { publicKeyImporter } = this.props;
    const { status, publicKeyError } = this.state;
    const interaction = this.interaction();
    if (status === UNSUPPORTED) {
      return (
        <FormHelperText error>
          {interaction.messageTextFor({ status })}
        </FormHelperText>
      );
    }
    return (
      <Box mt={2}>
        <Grid container>
          <Grid item md={6}>
            <TextField
              fullWidth
              label="BIP32 Path"
              value={publicKeyImporter.bip32Path}
              onChange={this.handleBIP32PathChange}
              disabled={status !== PENDING}
              error={this.hasBIP32PathError()}
              helperText={this.bip32PathError()}
            />
          </Grid>
          <Grid item md={6}>
            {!this.bip32PathIsDefault() && (
              <Button
                type="button"
                variant="contained"
                size="small"
                onClick={this.resetBIP32Path}
                disabled={status !== PENDING}
              >
                Default
              </Button>
            )}
          </Grid>
        </Grid>
        <FormHelperText>
          Use the default value if you don&rsquo;t understand BIP32 paths.
        </FormHelperText>
        <Box mt={2}>
          <Button
            type="button"
            variant="contained"
            color="primary"
            size="large"
            onClick={this.import}
            disabled={this.hasBIP32PathError() || status === ACTIVE}
          >
            Import Public Key
          </Button>
        </Box>
        <InteractionMessages
          messages={interaction.messagesFor({ state: status })}
          excludeCodes={["bip32"]}
        />
        <FormHelperText error>{publicKeyError}</FormHelperText>
      </Box>
    );
  };

  import = async () => {
    const {
      validateAndSetPublicKey,
      enableChangeMethod,
      disableChangeMethod,
    } = this.props;
    disableChangeMethod();
    this.setState({ publicKeyError: "", status: ACTIVE });
    try {
      const publicKey = await this.interaction().run();
      validateAndSetPublicKey(publicKey, (error) => {
        this.setState({ publicKeyError: error, status: PENDING });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      this.setState({ publicKeyError: e.message, status: PENDING });
    }

    enableChangeMethod();
  };

  hasBIP32PathError = () => {
    const { bip32PathError, status } = this.state;
    return (
      bip32PathError !== "" ||
      this.interaction().hasMessagesFor({
        state: status,
        level: ERROR,
        code: "bip32",
      })
    );
  };

  bip32PathError = () => {
    const { bip32PathError, status } = this.state;
    if (bip32PathError !== "") {
      return bip32PathError;
    }
    return this.interaction().messageTextFor({
      state: status,
      level: ERROR,
      code: "bip32",
    });
  };

  setBIP32PathError = (value) => {
    this.setState({ bip32PathError: value });
  };

  handleBIP32PathChange = (event) => {
    const { validateAndSetBIP32Path } = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(bip32Path, () => {}, this.setBIP32PathError);
  };

  bip32PathIsDefault = () => {
    const { publicKeyImporter, defaultBIP32Path } = this.props;
    return publicKeyImporter.bip32Path === defaultBIP32Path;
  };

  resetBIP32Path = () => {
    const { resetBIP32Path } = this.props;
    this.setBIP32PathError("");
    resetBIP32Path();
  };
}

HardwareWalletPublicKeyImporter.propTypes = {
  network: PropTypes.string.isRequired,
  publicKeyImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
    method: PropTypes.string,
  }).isRequired,
  validateAndSetPublicKey: PropTypes.func.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  enableChangeMethod: PropTypes.func.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
};

export default HardwareWalletPublicKeyImporter;
