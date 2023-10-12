import React, { useState } from "react";
import PropTypes from "prop-types";
import { HERMIT, ExportPublicKey } from "unchained-wallets";
import { validateBIP32Path } from "unchained-bitcoin";

// Components
import { FormGroup, FormHelperText } from "@mui/material";

import HermitReader from "../Hermit/HermitReader";

const HermitPublicKeyImporter = ({
  network,
  defaultBIP32Path,
  disableChangeMethod,
  validatePublicKey,
  onImport,
  enableChangeMethod,
}) => {
  const [publicKeyError, setPublicKeyError] = useState("");

  const interaction = () => {
    return ExportPublicKey({
      keystore: HERMIT,
      network,
      bip32Path: defaultBIP32Path,
    });
  };

  const handleReaderStart = () => {
    disableChangeMethod();
  };

  const handleReaderSuccess = (data) => {
    const { pubkey: nextPublicKey, bip32Path: nextBIP32Path } = data;

    enableChangeMethod();

    const bip32PathError = validateBIP32Path(nextBIP32Path);
    if (bip32PathError) {
      setPublicKeyError(bip32PathError);
      return;
    }

    const newPublicKeyError = validatePublicKey(nextPublicKey);
    if (newPublicKeyError) {
      setPublicKeyError(newPublicKeyError);
      return;
    }

    onImport({ publicKey: nextPublicKey, bip32Path: nextBIP32Path });
  };

  const handleReaderClear = () => {
    setPublicKeyError("");
    enableChangeMethod();
  };
  return (
    <FormGroup>
      <HermitReader
        startText="Import Public Key"
        interaction={interaction()}
        onStart={handleReaderStart}
        onSuccess={handleReaderSuccess}
        onClear={handleReaderClear}
      />
      <FormHelperText error>{publicKeyError}</FormHelperText>
    </FormGroup>
  );
};

HermitPublicKeyImporter.propTypes = {
  network: PropTypes.string.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  validatePublicKey: PropTypes.func.isRequired,
  enableChangeMethod: PropTypes.func.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
  onImport: PropTypes.func.isRequired,
};

export default HermitPublicKeyImporter;
