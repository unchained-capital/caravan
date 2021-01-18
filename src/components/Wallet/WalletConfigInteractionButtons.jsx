import React from "react";
import PropTypes from "prop-types";
import { Button, Grid } from "@material-ui/core";
import { CARAVAN_CONFIG } from "./constants";
import { CoboVaultDisplayer } from "../CoboVault";
import SyncWalletDescription from "../CoboVault/components/SyncWalletDescription";

const WalletConfigInteractionButtons = ({
  onClearFn,
  onDownloadFn,
  shouldRenderURButton,
  walletDetailsText,
  CoboVaultWalletVerifyCode,
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
          <CoboVaultDisplayer
            data={Buffer.from(walletDetailsText, "utf-8").toString("hex")}
            title="Scan the QR Code using Cobo Vault"
            renderDescription={() => {
              return (
                <SyncWalletDescription verifyCode={CoboVaultWalletVerifyCode} />
              );
            }}
            startText="Show Wallet For Cobo Vault"
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
  CoboVaultWalletVerifyCode: PropTypes.string.isRequired,
};

export default WalletConfigInteractionButtons;
