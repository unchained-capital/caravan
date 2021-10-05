import { Button } from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";

const FileScanner = (props) => {
  const {
    startText,
    interaction,
    handleSuccess,
    handleError,
    fileType,
    disable,
  } = props;

  const handleReadJSON = (targetFile) => {
    const fileReader = new FileReader();
    fileReader.readAsText(targetFile);
    fileReader.onload = (event) => {
      try {
        const file = event.target.result;
        const data = interaction.parseFile(file);
        const { result } = data;
        handleSuccess(result);
      } catch (e) {
        handleError(e);
      }
    };
  };

  const handleReadPSBT = (targetFile) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(targetFile);
    fileReader.onload = (event) => {
      try {
        const file = event.target.result;
        const data = interaction.parseFile(Buffer.from(file).toString("hex"));
        const { result } = data;
        handleSuccess(result);
      } catch (e) {
        handleError(e);
      }
    };
  };

  const handleReadFile = ({ target }) => {
    try {
      if (fileType === "json") {
        handleReadJSON(target.files[0]);
      } else {
        handleReadPSBT(target.files[0]);
      }
    } catch (e) {
      handleError(e);
    }
  };

  const accept = fileType === "json" ? "application/json" : ".psbt";

  return (
    <label htmlFor="upload-keystone-xpub">
      {!disable && (
        <input
          style={{ display: "none" }}
          id="upload-keystone-xpub"
          name="upload-keystone-xpub"
          accept={accept}
          onChange={handleReadFile}
          type="file"
        />
      )}

      <Button
        variant="contained"
        color="primary"
        component="span"
        disabled={disable}
      >
        {startText}
      </Button>
    </label>
  );
};

FileScanner.propTypes = {
  startText: PropTypes.string.isRequired,
  interaction: PropTypes.shape({
    parseFile: PropTypes.func.isRequired,
  }).isRequired,
  handleSuccess: PropTypes.func.isRequired,
  handleError: PropTypes.func.isRequired,
  fileType: PropTypes.string.isRequired,
  disable: PropTypes.bool,
};

FileScanner.defaultProps = {
  disable: false,
};

export default FileScanner;
