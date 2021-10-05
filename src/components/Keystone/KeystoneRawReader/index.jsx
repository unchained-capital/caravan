import { Grid } from "@material-ui/core";
import React from "react";
import PropTypes from "prop-types";
import QRReader from "../../QR/QRReader";
import FileScanner from "./FileScanner";

const KeystoneRawReader = (props) => {
  const {
    shouldShowFileReader,
    fileType,
    fileStartText,
    qrStartText,
    interaction,
    handleError,
    handleSuccess,
    handleStop,
    disable,
  } = props;
  return (
    <>
      <Grid item>
        <QRReader
          startText={qrStartText}
          interaction={interaction}
          handleError={handleError}
          handleSuccess={handleSuccess}
          handleStop={handleStop}
          disable={disable}
        />
      </Grid>
      {shouldShowFileReader && (
        <Grid item>
          <FileScanner
            startText={fileStartText}
            interaction={interaction}
            handleSuccess={handleSuccess}
            handleError={handleError}
            fileType={fileType}
            disable={disable}
          />
        </Grid>
      )}
    </>
  );
};

KeystoneRawReader.propTypes = {
  shouldShowFileReader: PropTypes.bool,
  fileStartText: PropTypes.string,
  qrStartText: PropTypes.string,
  interaction: PropTypes.shape({
    messageFor: PropTypes.func,
    parse: PropTypes.func,
    parseFile: PropTypes.func,
  }).isRequired,
  handleError: PropTypes.func,
  handleSuccess: PropTypes.func,
  handleStop: PropTypes.func,
  fileType: PropTypes.string,
  disable: PropTypes.bool,
};

KeystoneRawReader.defaultProps = {
  shouldShowFileReader: false,
  fileType: "json",
  fileStartText: "",
  qrStartText: "",
  handleError: () => {},
  handleStop: () => {},
  handleSuccess: () => {},
  disable: false,
};

export default KeystoneRawReader;
