import React, { useState } from "react";
import { Button } from "@material-ui/core";
import PropTypes from "prop-types";
import QRScanner from "./QRScanner";

const QRReader = (props) => {
  const { startText, disable, ...rest } = props;
  const [isOpen, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="contained"
        color="primary"
        component="span"
        disabled={disable}
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
  disable: PropTypes.bool,
};

QRReader.defaultProps = {
  disable: false,
};

export default QRReader;
