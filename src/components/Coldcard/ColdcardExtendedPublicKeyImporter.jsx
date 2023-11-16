import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { COLDCARD } from "unchained-wallets";
import { Box, FormGroup } from "@mui/material";
import { Network, P2SH } from "unchained-bitcoin";
import { ColdcardJSONReader } from ".";
import IndirectExtendedPublicKeyImporter from "../Wallet/IndirectExtendedPublicKeyImporter";

const ColdcardExtendedPublicKeyImporter = ({
  extendedPublicKeyImporter,
  validateAndSetExtendedPublicKey,
  validateAndSetBIP32Path,
  validateAndSetRootFingerprint,
  addressType,
  network,
  defaultBIP32Path,
}) => {
  // Unfortunately not possible to use our Multisig P2SH ROOT on a Coldcard atm
  // because they do not allow us to export m/45'/{0-1}'/0' yet.
  const getColdcardBip32Path = () => {
    const coinPath = network === Network.MAINNET ? "0" : "1";
    const coldcardP2SHPath = `m/45'/${coinPath}/0`;
    return addressType === P2SH ? coldcardP2SHPath : defaultBIP32Path;
  };

  const [coldcardMultisigBIP32Path, setColdcardMultisigBIP32Path] = useState(
    getColdcardBip32Path()
  );

  const resetColdcardBIP32Path = () => {
    validateAndSetBIP32Path(
      coldcardMultisigBIP32Path,
      () => {},
      () => {}
    );
  };

  useEffect(() => {
    if (extendedPublicKeyImporter.method === COLDCARD) {
      validateAndSetBIP32Path(
        coldcardMultisigBIP32Path,
        () => {},
        () => {},
        {}
      );
    }
  }, []);

  useEffect(() => {
    const newColdcardBIP32Path = getColdcardBip32Path();
    // eslint-disable-next-line react/no-did-update-set-state
    setColdcardMultisigBIP32Path(newColdcardBIP32Path);
    validateAndSetBIP32Path(
      newColdcardBIP32Path,
      () => {},
      () => {}
    );
    // Any updates to the network/addressType we should set the BIP32Path
  }, [network, addressType]);

  return (
    <Box mt={2}>
      <FormGroup>
        <IndirectExtendedPublicKeyImporter
          extendedPublicKeyImporter={extendedPublicKeyImporter}
          validateAndSetExtendedPublicKey={validateAndSetExtendedPublicKey}
          validateAndSetBIP32Path={validateAndSetBIP32Path}
          validateAndSetRootFingerprint={validateAndSetRootFingerprint}
          addressType={addressType}
          network={network}
          resetBIP32Path={resetColdcardBIP32Path}
          defaultBIP32Path={coldcardMultisigBIP32Path}
          Reader={ColdcardJSONReader}
        />
      </FormGroup>
    </Box>
  );
};

ColdcardExtendedPublicKeyImporter.propTypes = {
  extendedPublicKeyImporter: PropTypes.shape({
    method: PropTypes.string,
    bip32Path: PropTypes.string,
  }).isRequired,
  network: PropTypes.string.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetExtendedPublicKey: PropTypes.func.isRequired,
  validateAndSetRootFingerprint: PropTypes.func.isRequired,
  addressType: PropTypes.string.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
};

export default ColdcardExtendedPublicKeyImporter;
