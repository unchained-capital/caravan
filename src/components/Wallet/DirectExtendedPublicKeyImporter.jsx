import React from "react";
import PropTypes from "prop-types";
import {
  UNSUPPORTED,
  PENDING,
  ACTIVE,
  ERROR,
  ExportExtendedPublicKey,
} from "unchained-wallets";
import { Button, TextField, FormHelperText, Box, Grid } from "@mui/material";
import InteractionMessages from "../InteractionMessages";

class DirectExtendedPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      extendedPublicKeyError: "",
      status: this.interaction().isSupported() ? PENDING : UNSUPPORTED,
    };
  }

  componentDidMount = () => {
    this.resetBIP32Path();
  };

  interaction = () => {
    const { network, extendedPublicKeyImporter } = this.props;
    return ExportExtendedPublicKey({
      network,
      keystore: extendedPublicKeyImporter.method,
      bip32Path: extendedPublicKeyImporter.bip32Path,
      includeXFP: true,
    });
  };

  render = () => {
    const { extendedPublicKeyImporter } = this.props;
    const { status, extendedPublicKeyError } = this.state;
    const interaction = this.interaction();
    if (status === UNSUPPORTED) {
      return (
        <FormHelperText className="text-danger">
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
              value={extendedPublicKeyImporter.bip32Path}
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
            Import Extended Public Key
          </Button>
        </Box>
        <InteractionMessages
          messages={interaction.messagesFor({ state: status })}
        />
        <FormHelperText error>{extendedPublicKeyError}</FormHelperText>
      </Box>
    );
  };

  import = async () => {
    const {
      validateAndSetExtendedPublicKey,
      validateAndSetRootFingerprint,
      enableChangeMethod,
      disableChangeMethod,
    } = this.props;
    disableChangeMethod();
    this.setState({ extendedPublicKeyError: "", status: ACTIVE });
    try {
      const result = await this.interaction().run();
      const extendedPublicKey = result.xpub;
      validateAndSetRootFingerprint(result.rootFingerprint, (error) => {
        this.setState({ extendedPublicKeyError: error, status: PENDING });
      });
      validateAndSetExtendedPublicKey(extendedPublicKey, (error) => {
        this.setState({ extendedPublicKeyError: error, status: PENDING });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      this.setState({ extendedPublicKeyError: e.message, status: PENDING });
    }
    enableChangeMethod();
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
}

DirectExtendedPublicKeyImporter.propTypes = {
  network: PropTypes.string.isRequired,
  extendedPublicKeyImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
    method: PropTypes.string,
  }).isRequired,
  validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetRootFingerprint: PropTypes.func.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  enableChangeMethod: PropTypes.func.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
};

export default DirectExtendedPublicKeyImporter;
