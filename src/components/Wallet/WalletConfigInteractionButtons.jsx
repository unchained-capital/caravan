import React from "react";
import PropTypes from "prop-types";
import { Button, Grid } from "@material-ui/core";
import { CARAVAN_CONFIG } from "./constants";
import { KeystoneWalletPlayer } from "../Keystone";
import SyncWalletDescription from "../Keystone/components/SyncWalletDescription";

const WalletConfigInteractionButtons = ({
  onClearFn,
  onDownloadFn,
  shouldRenderURButton,
  walletDetailsText,
  KeystoneWalletVerifyCode,
}) => {
  const handleClearClick = (e) => {
    e.preventDefault();
    if (sessionStorage) sessionStorage.removeItem(CARAVAN_CONFIG);
    onClearFn(e);
  };

  return (
    <Grid container spacing={2}>
      <Grid item>
        <Button variant="contained" color="primary" onClick={onDownloadFn}>
          Download Wallet Details
        </Button>
      </Grid>
      {shouldRenderURButton && (
        <Grid item>
          <KeystoneWalletPlayer
            data={Buffer.from(walletDetailsText, "utf-8").toString("hex")}
            title="Scan the QR Code using Keystone"
            renderDescription={() => {
              return (
                <SyncWalletDescription verifyCode={KeystoneWalletVerifyCode} />
              );
            }}
            startText="Show Wallet For Keystone"
          />
        </Grid>
      )}
      <Grid item>
        <Button
          onClick={(e) => handleClearClick(e)}
          variant="contained"
          color="secondary"
        >
          Clear Wallet
        </Button>
      </Grid>
    </Grid>
  );
};

WalletConfigInteractionButtons.propTypes = {
  onClearFn: PropTypes.func.isRequired,
  onDownloadFn: PropTypes.func.isRequired,
  shouldRenderURButton: PropTypes.bool.isRequired,
  walletDetailsText: PropTypes.string.isRequired,
  KeystoneWalletVerifyCode: PropTypes.string.isRequired,
};

export default WalletConfigInteractionButtons;
