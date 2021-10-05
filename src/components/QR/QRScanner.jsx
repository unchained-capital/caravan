import React, { useState } from "react";
import { Button, FormHelperText, Grid, Modal } from "@material-ui/core";
import QrReader from "react-qr-reader";
import PropTypes from "prop-types";
import URProgress from "../Keystone/URProgress";
import styles from "./QR.module.scss";

const QR_CODE_READER_DELAY = 50; // ms

const QRScanner = (props) => {
  const { handleSuccess, handleStop, interaction, close } = props;
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const scan = (qr) => {
    if (error) {
      return;
    }
    if (qr) {
      try {
        const { success, result, progress: _progress } = interaction.parse(qr);
        if (success) {
          close();
          handleSuccess(result);
        } else {
          setProgress(_progress);
        }
      } catch (e) {
        setError(e);
      }
    }
  };

  return (
    <Modal open>
      <div className={styles.qrScannerContainer}>
        <Grid container direction="column" alignItems="center" justify="center">
          <Grid item>
            <QrReader
              delay={QR_CODE_READER_DELAY}
              onError={(err) => {
                setError(err);
              }}
              onScan={scan}
              style={{ width: 400 }}
              facingMode="user"
            />
            <URProgress progress={progress} />
          </Grid>
          {error && (
            <Grid item>
              <FormHelperText error>{error.message}</FormHelperText>
            </Grid>
          )}
          <Grid item alignItems="space-between">
            {error && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={() => {
                  setError(null);
                  setProgress(0);
                }}
              >
                Retry
              </Button>
            )}
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
  handleSuccess: PropTypes.func.isRequired,
  handleStop: PropTypes.func.isRequired,
  interaction: PropTypes.shape({
    parse: PropTypes.func.isRequired,
  }).isRequired,
  close: PropTypes.func.isRequired,
};

export default QRScanner;
