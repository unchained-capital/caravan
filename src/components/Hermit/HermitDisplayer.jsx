import React from "react";
import PropTypes from "prop-types";
import QRCode from "qrcode.react";
import Copyable from "../Copyable";

const HermitDisplayer = (props) => {
  const { width, string } = props;
  return (
    <Copyable text={string} newline showText={false}>
      <QRCode size={width} value={string} level="L" />
    </Copyable>
  );
};

HermitDisplayer.propTypes = {
  string: PropTypes.string,
  width: PropTypes.number,
};

HermitDisplayer.defaultProps = {
  string: "",
  width: 120,
};

export default HermitDisplayer;
