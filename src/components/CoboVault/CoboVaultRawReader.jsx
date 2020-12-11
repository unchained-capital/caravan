import { Button, Grid, Modal } from "@material-ui/core";
import QrReader from "react-qr-reader";
import React, { useState } from "react";
import PropTypes from "prop-types";
import URProgress from "./URProgress";

const QR_CODE_READER_DELAY = 300; // ms?

const QRScanner = (props) => {
  const { handleError, handleSuccess, handleStop, interaction, close } = props;
  const [qrs, setQRs] = useState([]);
  const [current, setCurrent] = useState(0);
  const [total, setTotal] = useState(0);
  const [type, setType] = useState("");

  const scan = (qr) => {
    if (qr) {
      try {
        const extendedQrs = qrs.concat([qr]);
        const {
          success,
          result,
          type: qrType,
          current: qrCurrent,
          total: qrTotal,
          workloads,
        } = interaction.parse(extendedQrs);
        setType(qrType);
        if (success) {
          close();
          handleSuccess(result);
        } else {
          setQRs(workloads);
          setCurrent(qrCurrent);
          setTotal(qrTotal);
        }
      } catch (e) {
        close();
        handleError(e);
      }
    }
  };

  return (
    <Modal open>
      <div className="qr-scanner__container">
        <Grid container direction="column" alignItems="center" justify="center">
          <Grid item>
            <QrReader
              delay={QR_CODE_READER_DELAY}
              onError={handleError}
              onScan={scan}
              style={{ width: 400 }}
              facingMode="user"
            />
            {type === "ur" && total > 0 && (
              <URProgress current={current} total={total} />
            )}
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              size="small"
              onClick={() => {
                close();
                handleStop();
              }}
            >
              Cancel
            </Button>
          </Grid>
        </Grid>
      </div>
    </Modal>
  );
};

QRScanner.propTypes = {
  handleError: PropTypes.func.isRequired,
  handleSuccess: PropTypes.func.isRequired,
  handleStop: PropTypes.func.isRequired,
  interaction: PropTypes.shape({
    parse: PropTypes.func.isRequired,
  }).isRequired,
  close: PropTypes.func.isRequired,
};

const QRReader = (props) => {
  const { startText, ...rest } = props;
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        component="span"
        onClick={() => setOpen(true)}
      >
        {startText}
      </Button>
      {isOpen && <QRScanner {...rest} close={() => setOpen(false)} />}
    </>
  );
};

QRReader.propTypes = {
  startText: PropTypes.string.isRequired,
};

const FileScanner = (props) => {
  const { startText, interaction, handleSuccess, handleError } = props;
  const handleReadFile = ({ target }) => {
    try {
      const fileReader = new FileReader();
      fileReader.readAsText(target.files[0]);
      fileReader.onload = (event) => {
        const file = event.target.result;
        const data = interaction.parseFile(file);
        const { result } = data;
        handleSuccess(result);
      };
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <label htmlFor="upload-cobo-xpub">
      <input
        style={{ display: "none" }}
        id="upload-cobo-xpub"
        name="upload-cobo-xpub"
        accept="application/json"
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
};

const CoboVaultRawReader = (props) => {
  const {
    shouldShowFileReader,
    fileStartText,
    qrStartText,
    interaction,
    handleError,
    handleSuccess,
    handleStop,
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
        />
      </Grid>
      {shouldShowFileReader && (
        <Grid item>
          <FileScanner
            startText={fileStartText}
            interaction={interaction}
            handleSuccess={handleSuccess}
            handleError={handleError}
          />
        </Grid>
      )}
    </>
  );
};

CoboVaultRawReader.propTypes = {
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
};

CoboVaultRawReader.defaultProps = {
  shouldShowFileReader: false,
  fileStartText: "",
  qrStartText: "",
  handleError: () => {},
  handleStop: () => {},
  handleSuccess: () => {},
};

export default CoboVaultRawReader;
