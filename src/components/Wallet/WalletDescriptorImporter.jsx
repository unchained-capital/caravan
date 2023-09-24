import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";

import { getWalletFromDescriptor, getChecksum } from "caravan-descriptors";
import {
  setRequiredSigners,
  setTotalSigners,
} from "../../actions/transactionActions";
import { setAddressType } from "../../actions/settingsActions";
import {
  setExtendedPublicKeyImporterBIP32Path,
  setExtendedPublicKeyImporterExtendedPublicKey,
  setExtendedPublicKeyImporterExtendedPublicKeyRootFingerprint,
  setExtendedPublicKeyImporterFinalized,
  setExtendedPublicKeyImporterMethod,
  setExtendedPublicKeyImporterName,
} from "../../actions/extendedPublicKeyImporterActions";
import { updateWalletUuidAction } from "../../actions/walletActions";

const importWalletDetails = (
  { keyOrigins, requiredSigners, addressType },
  dispatch
) => {
  dispatch(setTotalSigners(keyOrigins.length));
  dispatch(setRequiredSigners(requiredSigners));
  dispatch(setAddressType(addressType));
  keyOrigins.forEach(({ xfp, bip32Path, xpub }, index) => {
    const number = index + 1;
    dispatch(setExtendedPublicKeyImporterName(number, `key_${number}_${xfp}`));
    dispatch(setExtendedPublicKeyImporterMethod(number, "text"));
    dispatch(setExtendedPublicKeyImporterBIP32Path(number, bip32Path));
    dispatch(
      setExtendedPublicKeyImporterExtendedPublicKeyRootFingerprint(number, xfp)
    );
    dispatch(setExtendedPublicKeyImporterExtendedPublicKey(number, xpub));
    dispatch(setExtendedPublicKeyImporterFinalized(number, true));
  });
};

export const WalletDescriptorImporter = () => {
  const [walletConfig, setWalletConfig] = useState();
  const network = useSelector((state) => state.quorum.network);
  const dispatch = useDispatch();
  useEffect(() => {
    if (walletConfig) {
      importWalletDetails(walletConfig, dispatch);
    }
  }, [walletConfig]);

  const handleClick = async () => {
    // eslint-disable-next-line no-alert
    const descriptor = window.prompt(
      `Please enter one of the wallet's descriptors (change or receive).
Make sure any settings that are not in a descriptor are set before submitting.`
    );

    if (descriptor) {
      try {
        const config = await getWalletFromDescriptor(descriptor, network);
        const checksum = await getChecksum(descriptor);
        dispatch(updateWalletUuidAction(checksum));
        setWalletConfig(config);
      } catch (e) {
        // eslint-disable-next-line no-alert
        window.alert(e.message);
      }
    }
  };

  return (
    <Button color="secondary" variant="contained" onClick={handleClick}>
      Import Descriptor
    </Button>
  );
};
