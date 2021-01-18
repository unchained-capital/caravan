import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button, Grid, Modal, Slider } from "@material-ui/core";
import QRCode from "qrcode.react";
import PropTypes from "prop-types";
import { CoboVaultDisplayer as CoboVaultDisplayerInteraction } from "unchained-wallets";
import URProgress from "../CoboVault/URProgress";
import styles from "./QR.module.scss";

const MIN_WIDTH = 240;
const MAX_WIDTH = 360;

const QRPlayer = (props) => {
  const { data, title, description, close } = props;
  const qrs = useMemo(() => {
    const interaction = new CoboVaultDisplayerInteraction();
    return interaction.encodeUR(data);
  }, [data]);
  const refreshSpeed = 300;
  const [currentQR, setCurrentQR] = useState(0);
  const [width, setWidth] = useState(MIN_WIDTH);

  const [intervalId, setIntervalId] = useState(null);

  const clear = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const nextQR = useCallback(() => {
    setCurrentQR((current) => {
      return (current + 1) % qrs.length;
    });
  }, [qrs.length]);

  const run = () => {
    clear();
    const i = setInterval(nextQR, refreshSpeed);
    setIntervalId(i);
  };

  const pause = () => {
    clear();
    setIntervalId(null);
  };

  useEffect(() => {
    run();
    return () => {
      clear();
    };
  }, [qrs.length]);

  return qrs.length > 0 ? (
    <Modal open onClose={close}>
      <div className={styles.qrPlayerContainer}>
        {title && <p className={styles.qrPlayerTitle}>{title.toUpperCase()}</p>}
        {description && <p>{description}</p>}
        <div className={styles.qrPlayerCodeContainer}>
          <QRCode size={width} value={qrs[currentQR]} level="L" />
        </div>
        <URProgress current={currentQR + 1} total={qrs.length} />
        <Slider
          name="QR Size"
          min={MIN_WIDTH}
          max={MAX_WIDTH}
          onChange={(e, v) => {
            setWidth(v);
          }}
        />
        <Grid container spacing={1} direction="row-reverse">
          <Grid item>
            <Button variant="outlined" onClick={close}>
              Close
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" onClick={nextQR}>
              Next QR
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" onClick={pause}>
              Pause QR
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" onClick={run}>
              Run QR
            </Button>
          </Grid>
        </Grid>
      </div>
    </Modal>
  ) : null;
};

QRPlayer.propTypes = {
  data: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
};

export default QRPlayer;
