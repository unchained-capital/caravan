import React, { useState } from "react";
import { Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { COLDCARD, ConfigAdapter } from "unchained-wallets";
import { getWalletConfig } from "../../selectors/wallet";
import { setErrorNotification } from "../../actions/errorNotificationActions";
import { downloadFile } from "../../utils";

const DownloadColdardConfigButton = ({ ...otherProps }) => {
  const [isActive, setIsActive] = useState(false);
  const walletConfig = useSelector(getWalletConfig);
  const dispatch = useDispatch();

  const interaction = new ConfigAdapter({
    KEYSTORE: COLDCARD,
    jsonConfig: walletConfig,
  });

  const downloadWalletDetails = () => {
    setIsActive(true);
    try {
      const { startingAddressIndex } = walletConfig;
      // If this is a config that's been rekeyed, note that in the name.
      walletConfig.name =
        startingAddressIndex === 0
          ? walletConfig.name
          : `${walletConfig.name}_${startingAddressIndex.toString()}`;

      // At the moment (2020-Dec), Coldcard has just released a new firmware version
      // which addresses the following problem:  that they inverted the ordering
      // for p2sh-p2wsh as p2wsh-p2sh but we need to support the older firmware.
      walletConfig.addressType = walletConfig.addressType.includes("-")
        ? "P2WSH-P2SH"
        : walletConfig.addressType;

      const body = interaction.adapt();
      const filename = `wc-${walletConfig.name}.txt`;
      downloadFile(body, filename);
    } catch (e) {
      dispatch(setErrorNotification(e.message || e));
    } finally {
      setIsActive(false);
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={downloadWalletDetails}
      disabled={isActive}
      {...otherProps}
    >
      Download Coldcard Config
    </Button>
  );
};

export default DownloadColdardConfigButton;
