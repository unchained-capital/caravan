// eslint-disable-next-line max-classes-per-file
import React, { Component } from "react";
import PropTypes from "prop-types";
import Dropzone from "react-dropzone";
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  TextField,
} from "@material-ui/core";
import { CloudUpload as UploadIcon } from "@material-ui/icons";
import styles from "./ColdcardFileReader.module.scss";

class ColdcardFileReaderBase extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fileType: props.fileType || "JSON",
    };
  }

  render = () => {
    const {
      maxFileSize,
      validFileFormats,
      extendedPublicKeyImporter,
      handleBIP32PathChange,
      resetBIP32Path,
      bip32PathIsDefault,
      hasError,
      errorMessage,
      isTest,
    } = this.props;
    const { fileType } = this.state;
    return (
      <Grid container direction="column">
        {fileType === "JSON" && !isTest && (
          <Grid container>
            <Grid item md={6}>
              <TextField
                label="BIP32 Path"
                value={extendedPublicKeyImporter.bip32Path}
                onChange={handleBIP32PathChange}
                error={hasError}
                helperText={errorMessage}
              />
            </Grid>
            <Grid item md={6}>
              {!bip32PathIsDefault() && (
                <Button
                  type="button"
                  variant="contained"
                  size="small"
                  onClick={resetBIP32Path}
                >
                  Default
                </Button>
              )}
            </Grid>
            <FormHelperText>
              Use the default value if you don&rsquo;t understand BIP32 paths.
            </FormHelperText>
          </Grid>
        )}
        <p>
          When you are ready, upload the {fileType} file from your Coldcard:
        </p>
        <Box>
          <Dropzone
            className={hasError ? styles.dropzoneDull : styles.dropzone}
            onDrop={this.onDrop}
            multiple={false}
            minSize={1}
            maxSize={maxFileSize}
            accept={validFileFormats}
            disableClick={hasError}
          >
            <UploadIcon classes={{ root: styles.uploadIcon }} />
            <p className={styles.instruction}>
              {fileType === "JSON" ? "Upload The XPUB" : "Upload Signed PSBT"}
            </p>
          </Dropzone>
        </Box>
      </Grid>
    );
  };

  singleAcceptedFile = (acceptedFiles, rejectedFiles) => {
    return rejectedFiles.length === 0 && acceptedFiles.length === 1;
  };

  onDrop = (acceptedFiles, rejectedFiles) => {
    const { onReceive, onReceivePSBT, setError, hasError } = this.props;
    const { fileType } = this.state;
    if (hasError) return; // do not continue if the bip32path is invalid
    if (this.singleAcceptedFile(acceptedFiles, rejectedFiles)) {
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = () => {
        // eslint-disable-next-line no-unused-expressions
        fileType === "JSON"
          ? onReceive(reader.result)
          : onReceivePSBT(reader.result);
      };
      reader.readAsText(file);
    } else if (rejectedFiles.length === 1) {
      setError(
        `The file you attempted to upload was unacceptable. File type must be .${fileType.toLowerCase()}.`
      );
    } else if (rejectedFiles.length > 1) {
      setError(`This dropzone only accepts a single file.`);
    }
  };
}

ColdcardFileReaderBase.propTypes = {
  onReceive: PropTypes.func,
  onReceivePSBT: PropTypes.func,
  setError: PropTypes.func.isRequired,
  fileType: PropTypes.string,
  maxFileSize: PropTypes.number,
  validFileFormats: PropTypes.string,
  extendedPublicKeyImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
  }),
  handleBIP32PathChange: PropTypes.func,
  resetBIP32Path: PropTypes.func,
  bip32PathIsDefault: PropTypes.func,
  hasError: PropTypes.bool,
  errorMessage: PropTypes.string,
  isTest: PropTypes.bool,
};

ColdcardFileReaderBase.defaultProps = {
  onReceive: null,
  onReceivePSBT: null,
  handleBIP32PathChange: null,
  resetBIP32Path: null,
  bip32PathIsDefault: null,
  errorMessage: "",
  hasError: PropTypes.bool,
  maxFileSize: 1048576, // 1MB
  fileType: "JSON",
  validFileFormats: ".json",
  extendedPublicKeyImporter: null,
  isTest: false,
};

export class ColdcardJSONReader extends ColdcardFileReaderBase {}
ColdcardJSONReader.defaultProps = {
  fileType: "JSON",
  validFileFormats: ".json",
};

export class ColdcardPSBTReader extends ColdcardFileReaderBase {}
ColdcardPSBTReader.defaultProps = {
  fileType: "PSBT",
  validFileFormats: ".psbt",
};
