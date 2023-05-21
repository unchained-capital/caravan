import React from "react";
import PropTypes from "prop-types";
import {
  UNSUPPORTED,
  PENDING,
  ACTIVE,
  ERROR,
  ExportPublicKey,
  TREZOR,
  LEDGER,
} from "unchained-wallets";
import { validateBIP32Path } from "unchained-bitcoin";

// Components
import { Button, TextField, FormHelperText, Box, Grid } from "@mui/material";

import InteractionMessages from "../InteractionMessages";

class HardwareWalletPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bip32Path: props.defaultBIP32Path,
      publicKeyError: "",
      bip32PathError: "",
      status: this.interaction().isSupported() ? PENDING : UNSUPPORTED,
    };
  }

  interaction = () => {
    const { network, method, defaultBIP32Path } = this.props;
    const { bip32Path } = this.state;
    return ExportPublicKey({
      network,
      keystore: method,
      bip32Path: bip32Path ?? defaultBIP32Path,
    });
  };

  render = () => {
    const { status, bip32Path, publicKeyError } = this.state;
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
              value={bip32Path}
              variant="standard"
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
      enableChangeMethod,
      disableChangeMethod,
      validatePublicKey,
      onImport,
    } = this.props;
    const { bip32Path } = this.state;
    disableChangeMethod();
    this.setState({ publicKeyError: "", status: ACTIVE });
    try {
      const publicKey = await this.interaction().run();
      const error = validatePublicKey(publicKey);

      if (error) {
        this.setState({
          publicKeyError: error,
          status: PENDING,
        });
      } else {
        onImport({ publicKey, bip32Path });
      }
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

  handleBIP32PathChange = (event) => {
    const nextBIP32Path = event.target.value;
    const error = validateBIP32Path(nextBIP32Path);

    this.setState({
      bip32Path: nextBIP32Path,
      bip32PathError: error ?? "",
    });
  };

  bip32PathIsDefault = () => {
    const { bip32Path } = this.state;
    const { defaultBIP32Path } = this.props;
    return bip32Path === defaultBIP32Path;
  };

  resetBIP32Path = () => {
    const { defaultBIP32Path } = this.props;
    this.setState({
      bip32Path: defaultBIP32Path,
      bip32PathError: "",
    });
  };
}

HardwareWalletPublicKeyImporter.propTypes = {
  network: PropTypes.string.isRequired,
  method: PropTypes.oneOf([LEDGER, TREZOR]).isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  validatePublicKey: PropTypes.func.isRequired,
  enableChangeMethod: PropTypes.func.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
};

export default HardwareWalletPublicKeyImporter;
