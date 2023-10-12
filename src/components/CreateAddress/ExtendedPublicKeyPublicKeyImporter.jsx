import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  convertExtendedPublicKey,
  validateExtendedPublicKey,
  validateExtendedPublicKeyForNetwork,
  deriveChildPublicKey,
  validateBIP32Path,
} from "unchained-bitcoin";

// Components
import { Button, TextField, FormHelperText, Box, Grid } from "@mui/material";

const DEFAULT_BIP32_PATH = "m/0";

const ExtendedPublicKeyPublicKeyImporter = ({
  network,
  validatePublicKey,
  onImport,
}) => {
  const [bip32Path, setBip32Path] = useState(DEFAULT_BIP32_PATH);
  const [bip32PathError, setBip32PathError] = useState("");
  const [extendedPublicKey, setExtendedPublicKey] = useState("");
  const [extendedPublicKeyError, setExtendedPublicKeyError] = useState("");
  const [conversionMessage, setConversionMessage] = useState("");

  const importData = () => {
    const publicKey = deriveChildPublicKey(
      extendedPublicKey,
      bip32Path,
      network
    );

    const error = validatePublicKey(publicKey);
    if (error) {
      setBip32PathError(error);
    } else {
      onImport({ publicKey, bip32Path });
    }
  };

  const hasBIP32PathError = () => {
    return bip32PathError !== "";
  };

  const hasExtendedPublicKeyError = () => {
    return extendedPublicKeyError !== "";
  };

  const hasError = () => hasBIP32PathError() || hasExtendedPublicKeyError();

  const handleBIP32PathChange = (event) => {
    const nextBIP32Path = event.target.value;

    const error = validateBIP32Path(nextBIP32Path, {
      mode: "unhardened",
    });

    setBip32Path(nextBIP32Path);
    setBip32PathError(error ?? "");
  };

  const bip32PathIsDefault = () => {
    return bip32Path === DEFAULT_BIP32_PATH;
  };

  const resetBIP32Path = () => {
    setBip32Path(DEFAULT_BIP32_PATH);
    setBip32PathError("");
  };

  const handleExtendedPublicKeyChange = (event) => {
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
        setExtendedPublicKey(event.target.value);
        setExtendedPublicKeyError(error.message);
        setConversionMessage("");

        return;
      }
    }

    const validationError = validateExtendedPublicKey(
      actualExtendedPublicKey,
      network
    );
    if (validationError !== "") {
      setExtendedPublicKey(event.target.value);
      setExtendedPublicKeyError(validationError);
      setConversionMessage("");

      return;
    }
    const newConversionMessage =
      actualExtendedPublicKey === extendedPublicKey
        ? ""
        : `Your extended public key has been converted from ${extendedPublicKey.slice(
            0,
            4
          )} to ${actualExtendedPublicKey.slice(0, 4)}`;
    setExtendedPublicKey(actualExtendedPublicKey);
    setExtendedPublicKeyError("");
    setConversionMessage(newConversionMessage);
  };

  return (
    <div>
      <Box mt={2}>
        <TextField
          fullWidth
          name="extendedPublicKey"
          label="Extended Public Key"
          value={extendedPublicKey}
          variant="standard"
          onChange={handleExtendedPublicKeyChange}
          error={hasExtendedPublicKeyError()}
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
              variant="standard"
              onChange={handleBIP32PathChange}
              error={hasBIP32PathError()}
              helperText={bip32PathError}
            />
            <FormHelperText>
              Use the default value if you don&rsquo;t understand BIP32 paths.
            </FormHelperText>
          </Grid>
          <Grid item md={2}>
            {!bip32PathIsDefault() && (
              <Button
                type="button"
                variant="contained"
                size="small"
                onClick={resetBIP32Path}
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
            onClick={importData}
            disabled={extendedPublicKey === "" || hasError()}
          >
            Import Public Key
          </Button>
        </Box>
      </Box>
    </div>
  );
};

ExtendedPublicKeyPublicKeyImporter.propTypes = {
  network: PropTypes.string.isRequired,
  validatePublicKey: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
};

export default ExtendedPublicKeyPublicKeyImporter;
