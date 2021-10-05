import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ERROR, ExportExtendedPublicKey, PENDING } from "unchained-wallets";

// Components
import {
  Button,
  FormGroup,
  FormHelperText,
  Grid,
  TextField,
} from "@material-ui/core";

import { P2SH } from "unchained-bitcoin";
import { KeystoneReader } from "./index";

const KeystoneExtendedPublicKeyImporter = (props) => {
  const {
    network,
    extendedPublicKeyImporter,
    disableChangeMethod,
    validateAndSetBIP32Path,
    validateAndSetExtendedPublicKey,
    enableChangeMethod,
    validateAndSetRootFingerprint,
    defaultBIP32Path,
    addressType,
  } = props;
  const [extendedPublicKeyError, setExtendedPublicKeyError] = useState("");

  const getBip32Path = useCallback(() => {
    const p2shPath = `m/45'`;
    return addressType === P2SH ? p2shPath : defaultBIP32Path;
  }, [defaultBIP32Path, addressType]);

  const resetKeystonePath = useCallback(() => {
    validateAndSetBIP32Path(
      getBip32Path(),
      () => {},
      () => {}
    );
  }, [validateAndSetBIP32Path, getBip32Path]);

  useEffect(() => {
    resetKeystonePath();
  }, [network, addressType, resetKeystonePath]);

  const interaction = new ExportExtendedPublicKey({
    keystore: extendedPublicKeyImporter.method,
    network,
    bip32Path: extendedPublicKeyImporter.bip32Path,
    includeXFP: true,
    addressType,
  });

  const importExtendedPublicKey = (data) => {
    enableChangeMethod();
    const { xpub, bip32Path, rootFingerprint: fingerprint } = data;
    validateAndSetBIP32Path(
      bip32Path,
      () => {
        validateAndSetExtendedPublicKey(xpub, setExtendedPublicKeyError, () => {
          validateAndSetRootFingerprint(fingerprint);
        });
      },
      setExtendedPublicKeyError
    );
  };

  const onClear = () => {
    resetKeystonePath();
    setExtendedPublicKeyError("");
    enableChangeMethod();
  };

  const hasBIP32PathError = () => {
    return interaction.hasMessagesFor({
      state: PENDING,
      level: ERROR,
      code: "bip32_path",
    });
  };

  const bip32PathError = () => {
    return interaction.messageTextFor({
      state: PENDING,
      level: ERROR,
      code: "bip32_path",
    });
  };

  const handleBIP32PathChange = (event) => {
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(
      bip32Path,
      () => {},
      () => {}
    );
  };

  const bip32PathIsDefault = () => {
    return extendedPublicKeyImporter.bip32Path === getBip32Path();
  };

  return (
    <FormGroup>
      <Grid container direction="column">
        <Grid container>
          <Grid item md={6}>
            <TextField
              label="BIP32 Path"
              value={extendedPublicKeyImporter.bip32Path}
              onChange={handleBIP32PathChange}
              error={hasBIP32PathError()}
              helperText={bip32PathError()}
            />
          </Grid>
          <Grid item md={6}>
            {!bip32PathIsDefault() && (
              <Button
                type="button"
                variant="contained"
                size="small"
                onClick={resetKeystonePath}
              >
                Default
              </Button>
            )}
          </Grid>
          <FormHelperText>
            Use the default value if you don&rsquo;t understand BIP32 paths.
          </FormHelperText>
        </Grid>
      </Grid>
      <KeystoneReader
        qrStartText="Import Extended Public Key"
        fileStartText="Upload Extended Public Key"
        interaction={interaction}
        onStart={disableChangeMethod}
        onSuccess={importExtendedPublicKey}
        onClear={onClear}
        disable={hasBIP32PathError()}
        shouldShowFileReader
        fileType="json"
      />
      <FormHelperText className="text-danger">
        {extendedPublicKeyError}
      </FormHelperText>
    </FormGroup>
  );
};

KeystoneExtendedPublicKeyImporter.propTypes = {
  enableChangeMethod: PropTypes.func.isRequired,
  extendedPublicKeyImporter: PropTypes.shape({
    method: PropTypes.string,
    bip32Path: PropTypes.string,
  }).isRequired,
  addressType: PropTypes.string.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
  network: PropTypes.string.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
  validateAndSetRootFingerprint: PropTypes.func.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
};

export default KeystoneExtendedPublicKeyImporter;
