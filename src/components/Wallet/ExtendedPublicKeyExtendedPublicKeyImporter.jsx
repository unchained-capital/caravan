import React from "react";
import PropTypes from "prop-types";
import {
  validateExtendedPublicKey,
  deriveChildExtendedPublicKey,
} from "unchained-bitcoin";

// Components
import { Button, TextField, FormHelperText, Box, Grid } from "@mui/material";

const DEFAULT_BIP32_PATH = "m/0";

class ExtendedPublicKeyExtendedPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: "",
      extendedPublicKey: "",
      extendedPublicKeyError: "",
      bip32PathError: "",
    };
  }

  componentDidMount = () => {
    this.setBIP32PathToDefault();
  };

  render = () => {
    const { extendedPublicKeyImporter } = this.props;
    const { error, extendedPublicKey, extendedPublicKeyError, bip32PathError } =
      this.state;
    return (
      <div>
        <Box mt={2}>
          <TextField
            fullWidth
            name="extendedPublicKey"
            label="Extended Public Key"
            value={extendedPublicKey}
            variant="standard"
            onChange={this.handleExtendedPublicKeyChange}
            error={this.hasExtendedPublicKeyError()}
            helperText={extendedPublicKeyError}
          />
        </Box>

        <Box mt={2}>
          <Grid container>
            <Grid item md={10}>
              <TextField
                fullWidth
                name="bip32Path"
                label="BIP32 Path (relative to xpub)"
                type="text"
                value={extendedPublicKeyImporter.bip32Path}
                variant="standard"
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
              Import Extended Public Key
            </Button>
          </Box>
        </Box>
        <FormHelperText className="text-danger">{error}</FormHelperText>
      </div>
    );
  };

  import = () => {
    const {
      network,
      extendedPublicKeyImporter,
      validateAndSetExtendedPublicKey,
    } = this.props;
    const { extendedPublicKey } = this.state;
    const childExtendedPublicKey = deriveChildExtendedPublicKey(
      extendedPublicKey,
      extendedPublicKeyImporter.bip32Path,
      network
    );
    validateAndSetExtendedPublicKey(childExtendedPublicKey, (error) => {
      this.setState({ error });
    });
  };

  setBIP32PathToDefault = () => {
    const { validateAndSetBIP32Path } = this.props;
    validateAndSetBIP32Path(
      DEFAULT_BIP32_PATH,
      () => {},
      () => {}
    );
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

  setBIP32PathError = (value) => {
    this.setState({ bip32PathError: value });
  };

  handleBIP32PathChange = (event) => {
    const { validateAndSetBIP32Path } = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(bip32Path, () => {}, this.setBIP32PathError, {
      mode: "unhardened",
    });
  };

  bip32PathIsDefault = () => {
    const { extendedPublicKeyImporter } = this.props;
    return extendedPublicKeyImporter.bip32Path === DEFAULT_BIP32_PATH;
  };

  resetBIP32Path = () => {
    this.setBIP32PathToDefault();
    this.setBIP32PathError("");
  };

  handleExtendedPublicKeyChange = (event) => {
    const { network, extendedPublicKeyImporters } = this.props;
    const extendedPublicKey = event.target.value;
    let extendedPublicKeyError = validateExtendedPublicKey(
      extendedPublicKey,
      network
    );
    if (extendedPublicKeyError === "") {
      if (
        Object.values(extendedPublicKeyImporters).find(
          (extendedPublicKeyImporter) =>
            extendedPublicKeyImporter.extendedPublicKey === extendedPublicKey
        )
      ) {
        extendedPublicKeyError =
          "This extended public key has already been imported.";
      }
    }
    this.setState({ extendedPublicKey, extendedPublicKeyError });
  };
}

ExtendedPublicKeyExtendedPublicKeyImporter.propTypes = {
  network: PropTypes.string.isRequired,
  extendedPublicKeyImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
  }).isRequired,
  extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
  validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
};

export default ExtendedPublicKeyExtendedPublicKeyImporter;
