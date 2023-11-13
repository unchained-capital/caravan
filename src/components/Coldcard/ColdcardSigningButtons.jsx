import React from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";

const ColdcardSigningButtons = ({
  handlePSBTDownloadClick,
  handleWalletConfigDownloadClick,
}) => {
  return (
    <>
      <Button
        type="button"
        variant="contained"
        color="primary"
        onClick={handlePSBTDownloadClick}
      >
        Download PSBT
      </Button>
      <Button
        type="button"
        variant="contained"
        onClick={handleWalletConfigDownloadClick}
      >
        Download Coldcard Config
      </Button>
    </>
  );
};

ColdcardSigningButtons.propTypes = {
  handlePSBTDownloadClick: PropTypes.func.isRequired,
  handleWalletConfigDownloadClick: PropTypes.func.isRequired,
};

export default ColdcardSigningButtons;
