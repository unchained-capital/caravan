import React, { useState } from "react";
import { Button, Grid, Modal } from "@material-ui/core";
import QrReader from "react-qr-reader";
import PropTypes from "prop-types";
import URProgress from "../CoboVault/URProgress";
import styles from "./QR.module.scss";

const QR_CODE_READER_DELAY = 300; // ms

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
      <div className={styles.qrScannerContainer}>
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

export default QRScanner;
