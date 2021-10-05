import React from "react";
import PropTypes from "prop-types";

const URProgress = ({ progress }) => {
  const num = Math.floor(100 * progress);
  return (
    <div style={{ textAlign: "center" }}>
      <p> {`${num}%`} </p>
    </div>
  );
};

URProgress.propTypes = {
  progress: PropTypes.number.isRequired,
};

export default URProgress;
