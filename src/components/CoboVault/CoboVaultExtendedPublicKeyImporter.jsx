import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { CoboVaultExportExtendedPublicKey } from "unchained-wallets";

// Components
import { FormGroup, FormHelperText } from "@material-ui/core";

import { CoboVaultReader } from "./index";

const CoboVaultExtendedPublicKeyImporter = (props) => {
  const {
    resetBIP32Path,
    network,
    extendedPublicKeyImporter,
    disableChangeMethod,
    validateAndSetBIP32Path,
    validateAndSetExtendedPublicKey,
    enableChangeMethod,
    validateAndSetRootFingerprint,
    reset,
  } = props;
  const [extendedPublicKeyError, setExtendedPublicKeyError] = useState("");
  useEffect(() => {
    resetBIP32Path();
  }, [resetBIP32Path]);

  const interaction = () => {
    return new CoboVaultExportExtendedPublicKey({
      network,
      bip32Path: extendedPublicKeyImporter.bip32Path,
    });
  };

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
    reset(true); // clear BIP32 path
    setExtendedPublicKeyError("");
    enableChangeMethod();
  };

  return (
    <FormGroup>
      <CoboVaultReader
        qrStartText="Import Extended Public Key"
        fileStartText="Upload Extended Public Key"
        interaction={interaction()}
        onStart={disableChangeMethod}
        onSuccess={importExtendedPublicKey}
        onClear={onClear}
        shouldShowFileReader
        fileType="json"
      />
      <FormHelperText className="text-danger">
        {extendedPublicKeyError}
      </FormHelperText>
    </FormGroup>
  );
};

CoboVaultExtendedPublicKeyImporter.propTypes = {
  enableChangeMethod: PropTypes.func.isRequired,
  extendedPublicKeyImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
  }).isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
  network: PropTypes.string.isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
  validateAndSetRootFingerprint: PropTypes.func.isRequired,
};

export default CoboVaultExtendedPublicKeyImporter;
