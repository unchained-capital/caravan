import React, { useState } from "react";
import { Button } from "@material-ui/core";
import PropTypes from "prop-types";
import QRScanner from "./QRScanner";

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

export default QRReader;
