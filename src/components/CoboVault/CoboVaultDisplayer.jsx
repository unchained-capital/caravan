import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@material-ui/core";
import { CameraAltOutlined } from "@material-ui/icons";
import QRPlayer from "../QR/QRPlayer";

const CoboVaultDisplayer = (props) => {
  const { startText, buttonStyle, ...rest } = props;
  const [isOpen, setOpen] = useState(false);
  const { variant, color, withIcon } = buttonStyle;
  return (
    <>
      <Button
        startIcon={withIcon ? <CameraAltOutlined /> : undefined}
        variant={variant}
        color={color}
        onClick={() => setOpen(true)}
      >
        {startText}
      </Button>
      {isOpen && <QRPlayer {...rest} close={() => setOpen(false)} />}
    </>
  );
};

CoboVaultDisplayer.propTypes = {
  startText: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  buttonStyle: PropTypes.shape({
    variant: PropTypes.string,
    color: PropTypes.string,
    withIcon: PropTypes.bool,
  }),
  title: PropTypes.string,
  description: PropTypes.string,
};

CoboVaultDisplayer.defaultProps = {
  buttonStyle: {
    variant: "contained",
    color: "primary",
    withIcon: false,
  },
  title: "",
  description: "",
};

export default CoboVaultDisplayer;
