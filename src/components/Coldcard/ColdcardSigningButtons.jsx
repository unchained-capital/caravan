import React from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";

const ColdcardSigningButtons = (props) => {
  const { handlePSBTDownloadClick, handleWalletConfigDownloadClick } = props;
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
