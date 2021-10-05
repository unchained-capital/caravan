import React, { useEffect, useState } from "react";
import { Button, Grid, Modal, Slider } from "@material-ui/core";
import QRCode from "qrcode.react";
import PropTypes from "prop-types";
import styles from "./QR.module.scss";

const MIN_WIDTH = 240;
const MAX_WIDTH = 360;

const QRPlayer = (props) => {
  const { urEncoder, title, description, close, renderDescription } = props;
  const refreshSpeed = 300;
  const [currentQR, setCurrentQR] = useState(urEncoder.nextPart());
  const [width, setWidth] = useState(MIN_WIDTH);

  useEffect(() => {
    const i = setInterval(
      () => setCurrentQR(urEncoder.nextPart()),
      refreshSpeed
    );
    return () => {
      clearInterval(i);
    };
  }, [urEncoder]);
  return (
    <Modal open onClose={close}>
      <div className={styles.qrPlayerContainer}>
        {title && <p className={styles.qrPlayerTitle}>{title.toUpperCase()}</p>}
        {description && <p>{description}</p>}
        {renderDescription && renderDescription()}
        <div className={styles.qrPlayerCodeContainer}>
          <QRCode size={width} value={currentQR} level="L" />
        </div>
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
        </Grid>
      </div>
    </Modal>
  );
};

QRPlayer.propTypes = {
  urEncoder: PropTypes.shape({
    nextPart: PropTypes.func,
  }).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  close: PropTypes.func.isRequired,
  renderDescription: PropTypes.func.isRequired,
};

export default QRPlayer;
