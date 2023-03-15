import React, { useMemo, useState } from "react";
import { Button } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import { COLDCARD, ConfigAdapter } from "unchained-wallets";
import { getWalletConfig } from "../../selectors/wallet";
import { setErrorNotification } from "../../actions/errorNotificationActions";
import { downloadFile } from "../../utils";

const DownloadColdardConfigButton = ({ ...otherProps }) => {
  const [disabledButton, setButtonDisabled] = useState(false);
  const walletConfig = useSelector(getWalletConfig);
  const dispatch = useDispatch();

  const interaction = useMemo(() => {
    const hasXfps = walletConfig?.extendedPublicKeys?.every(
      (xpub) => xpub?.xfp.length === 8
    );
    if (hasXfps)
      return new ConfigAdapter({
        KEYSTORE: COLDCARD,
        jsonConfig: walletConfig,
      });

    // can't set the wallet config without xfps
    // should setup to be masked in the future like
    // with bip32 paths
    setButtonDisabled(true);
    return null;
  }, [walletConfig]);

  const downloadWalletDetails = () => {
    setButtonDisabled(true);
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
      setButtonDisabled(false);
    }
  };

  return (
    <Button
      variant="outlined"
      onClick={downloadWalletDetails}
      disabled={disabledButton}
      {...otherProps}
    >
      Download Coldcard Config
    </Button>
  );
};

export default DownloadColdardConfigButton;
