import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { Button } from "@mui/material";
import { getMaskedDerivation } from "unchained-bitcoin";
import { encodeDescriptors } from "caravan-descriptors";
import { getWalletConfig } from "../../selectors/wallet";
import { downloadFile } from "../../utils";

export const DownloadDescriptors = () => {
  const walletConfig = useSelector(getWalletConfig);
  const [descriptors, setDescriptors] = useState({ change: "", receive: "" });

  useEffect(() => {
    const loadAsync = async () => {
      const multisigConfig = {
        requiredSigners: walletConfig.quorum.requiredSigners,
        keyOrigins: walletConfig.extendedPublicKeys.map(
          ({ xfp, bip32Path, xpub }) => ({
            xfp,
            bip32Path: getMaskedDerivation({ xpub, bip32Path }),
            xpub,
          })
        ),
        addressType: walletConfig.addressType,
        network: walletConfig.network,
      };
      const { change, receive } = await encodeDescriptors(multisigConfig);
      setDescriptors({ change, receive });
    };
    loadAsync();
  }, []);

  const handleDownload = () => {
    if (descriptors.change) {
      downloadFile(
        JSON.stringify(descriptors, null, 2),
        `${walletConfig.uuid}.txt`
      );
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={handleDownload}
      disabled={!descriptors.change || !descriptors.receive}
    >
      Download Descriptors
    </Button>
  );
};
