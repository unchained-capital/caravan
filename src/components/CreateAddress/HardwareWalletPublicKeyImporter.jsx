import React, { useCallback, useState } from "react";
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

const HardwareWalletPublicKeyImporter = ({
  enableChangeMethod,
  disableChangeMethod,
  validatePublicKey,
  onImport,
  network,
  method,
  defaultBIP32Path,
}) => {
  const [bip32Path, setBip32Path] = useState(defaultBIP32Path);
  const [bip32PathError, setBip32PathError] = useState("");
  const [publicKeyError, setPublicKeyError] = useState("");

  const interaction = useCallback(() => {
    return ExportPublicKey({
      network,
      keystore: method,
      bip32Path: bip32Path ?? defaultBIP32Path,
    });
  }, [network, method, bip32Path]);

  const [status, setStatus] = useState(
    interaction().isSupported() ? PENDING : UNSUPPORTED
  );

  const importData = async () => {
    disableChangeMethod();

    setPublicKeyError("");
    setStatus(ACTIVE);

    try {
      const publicKey = await interaction().run();
      const error = validatePublicKey(publicKey);

      if (error) {
        setPublicKeyError(error);
        setStatus(PENDING);
      } else {
        onImport({ publicKey, bip32Path });
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      setPublicKeyError(e.message);
      setStatus(PENDING);
    }

    enableChangeMethod();
  };

  const hasBIP32PathError = () => {
    return (
      bip32PathError !== "" ||
      interaction().hasMessagesFor({
        state: status,
        level: ERROR,
        code: "bip32",
      })
    );
  };

  const checkBip32PathError = () => {
    if (bip32PathError !== "") {
      return bip32PathError;
    }
    return interaction().messageTextFor({
      state: status,
      level: ERROR,
      code: "bip32",
    });
  };

  const handleBIP32PathChange = (event) => {
    const nextBIP32Path = event.target.value;
    const error = validateBIP32Path(nextBIP32Path);

    setBip32Path(nextBIP32Path);
    setBip32PathError(error ?? "");
  };

  const bip32PathIsDefault = () => {
    return bip32Path === defaultBIP32Path;
  };

  const resetBIP32Path = () => {
    setBip32Path(defaultBIP32Path);
    setBip32PathError("");
  };

  const renderHardWareWalletPublicKeyImporter = () => {
    const newInteraction = interaction();
    if (status === UNSUPPORTED) {
      return (
        <FormHelperText error>
          {newInteraction.messageTextFor({ status })}
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
              onChange={handleBIP32PathChange}
              disabled={status !== PENDING}
              error={hasBIP32PathError()}
              helperText={checkBip32PathError()}
            />
          </Grid>
          <Grid item md={6}>
            {!bip32PathIsDefault() && (
              <Button
                type="button"
                variant="contained"
                size="small"
                onClick={resetBIP32Path}
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
            onClick={importData}
            disabled={hasBIP32PathError() || status === ACTIVE}
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
  return renderHardWareWalletPublicKeyImporter();
};

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
