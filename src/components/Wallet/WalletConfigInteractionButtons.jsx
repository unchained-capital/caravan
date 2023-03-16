import React from "react";
import PropTypes from "prop-types";
import { Button, Grid } from "@mui/material";
import { CARAVAN_CONFIG } from "./constants";

const WalletConfigInteractionButtons = ({ onClearFn, onDownloadFn }) => {
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
      <Grid item>
        <Button
          onClick={(e) => handleClearClick(e)}
          variant="contained"
          color="warning"
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
};

export default WalletConfigInteractionButtons;
