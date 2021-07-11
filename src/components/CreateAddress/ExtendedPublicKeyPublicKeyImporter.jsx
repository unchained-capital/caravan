import React from "react";
import PropTypes from "prop-types";
import {
  convertExtendedPublicKey,
  validateExtendedPublicKey,
  validateExtendedPublicKeyForNetwork,
  deriveChildPublicKey,
  validateBIP32Path,
} from "unchained-bitcoin";

// Components
import {
  Button,
  TextField,
  FormHelperText,
  Box,
  Grid,
} from "@material-ui/core";

const DEFAULT_BIP32_PATH = "m/0";

class ExtendedPublicKeyPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      bip32Path: DEFAULT_BIP32_PATH,
      extendedPublicKey: "",
      extendedPublicKeyError: "",
      bip32PathError: "",
      conversionMessage: "",
    };
  }

  render = () => {
    const {
      bip32Path,
      extendedPublicKey,
      extendedPublicKeyError,
      bip32PathError,
      conversionMessage,
    } = this.state;
    return (
      <div>
        <Box mt={2}>
          <TextField
            fullWidth
            name="extendedPublicKey"
            label="Extended Public Key"
            value={extendedPublicKey}
            onChange={this.handleExtendedPublicKeyChange}
            error={this.hasExtendedPublicKeyError()}
            helperText={extendedPublicKeyError}
          />
        </Box>
        {conversionMessage !== "" && (
          <Box mb={2}>
            <FormHelperText>
              {conversionMessage}, this may indicate an invalid network setting,
              if so correct setting, remove key and try again.
            </FormHelperText>
          </Box>
        )}

        <Box mt={2}>
          <Grid container>
            <Grid item md={10}>
              <TextField
                fullWidth
                name="bip32Path"
                label="BIP32 Path (relative to xpub)"
                type="text"
                value={bip32Path}
                onChange={this.handleBIP32PathChange}
                error={this.hasBIP32PathError()}
                helperText={bip32PathError}
              />
              <FormHelperText>
                Use the default value if you don&rsquo;t understand BIP32 paths.
              </FormHelperText>
            </Grid>
            <Grid item md={2}>
              {!this.bip32PathIsDefault() && (
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  onClick={this.resetBIP32Path}
                >
                  Default
                </Button>
              )}
            </Grid>
          </Grid>
          <Box mt={2}>
            <Button
              type="button"
              variant="contained"
              color="primary"
              size="large"
              onClick={this.import}
              disabled={extendedPublicKey === "" || this.hasError()}
            >
              Import Public Key
            </Button>
          </Box>
        </Box>
      </div>
    );
  };

  import = () => {
    const { network, validatePublicKey, onImport } = this.props;
    const { extendedPublicKey, bip32Path } = this.state;
    const publicKey = deriveChildPublicKey(
      extendedPublicKey,
      bip32Path,
      network
    );

    const error = validatePublicKey(publicKey);
    if (error) {
      this.setState({
        bip32PathError: error,
      });
    } else {
      onImport({ publicKey, bip32Path });
    }
  };

  hasBIP32PathError = () => {
    const { bip32PathError } = this.state;
    return bip32PathError !== "";
  };

  hasExtendedPublicKeyError = () => {
    const { extendedPublicKeyError } = this.state;
    return extendedPublicKeyError !== "";
  };

  hasError = () => this.hasBIP32PathError() || this.hasExtendedPublicKeyError();

  handleBIP32PathChange = (event) => {
    const nextBIP32Path = event.target.value;

    const error = validateBIP32Path(nextBIP32Path, {
      mode: "unhardened",
    });

    this.setState({
      bip32Path: nextBIP32Path,
      bip32PathError: error ?? "",
    });
  };

  bip32PathIsDefault = () => {
    const { bip32Path } = this.state;
    return bip32Path === DEFAULT_BIP32_PATH;
  };

  resetBIP32Path = () => {
    this.setState({
      bip32Path: DEFAULT_BIP32_PATH,
      bip32PathError: "",
    });
  };

  handleExtendedPublicKeyChange = (event) => {
    const { network } = this.props;

    const extendedPublicKey = event.target.value;

    const networkError = validateExtendedPublicKeyForNetwork(
      extendedPublicKey,
      network
    );
    let actualExtendedPublicKey = extendedPublicKey;
    if (networkError !== "") {
      try {
        actualExtendedPublicKey = convertExtendedPublicKey(
          extendedPublicKey,
          network === "testnet" ? "tpub" : "xpub"
        );
      } catch (error) {
        this.setState({
          extendedPublicKey,
          extendedPublicKeyError: error.message,
          conversionMessage: "",
        });
        return;
      }
    }

    const validationError = validateExtendedPublicKey(
      actualExtendedPublicKey,
      network
    );
    if (validationError !== "") {
      this.setState({
        extendedPublicKey,
        extendedPublicKeyError: validationError,
        conversionMessage: "",
      });
      return;
    }
    const conversionMessage =
      actualExtendedPublicKey === extendedPublicKey
        ? ""
        : `Your extended public key has been converted from ${extendedPublicKey.slice(
            0,
            4
          )} to ${actualExtendedPublicKey.slice(0, 4)}`;

    this.setState({
      extendedPublicKey: actualExtendedPublicKey,
      extendedPublicKeyError: "",
      conversionMessage,
    });
  };
}

ExtendedPublicKeyPublicKeyImporter.propTypes = {
  network: PropTypes.string.isRequired,
  validatePublicKey: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
};

export default ExtendedPublicKeyPublicKeyImporter;
