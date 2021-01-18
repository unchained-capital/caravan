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
  } = props;

  const handleReadJSON = (targetFile) => {
    const fileReader = new FileReader();
    fileReader.readAsText(targetFile);
    fileReader.onload = (event) => {
      const file = event.target.result;
      const data = interaction.parseFile(file);
      const { result } = data;
      handleSuccess(result);
    };
  };

  const handleReadPSBT = (targetFile) => {
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(targetFile);
    fileReader.onload = (event) => {
      const file = event.target.result;
      const data = interaction.parseFile(Buffer.from(file).toString("hex"));
      const { result } = data;
      handleSuccess(result);
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
    <label htmlFor="upload-cobo-xpub">
      <input
        style={{ display: "none" }}
        id="upload-cobo-xpub"
        name="upload-cobo-xpub"
        accept={accept}
        onChange={handleReadFile}
        type="file"
      />

      <Button variant="contained" color="primary" component="span">
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
};

export default FileScanner;
