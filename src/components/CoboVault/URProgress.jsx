import React from "react";
import PropTypes from "prop-types";

const URProgress = ({ current, total }) => {
  return (
    <div style={{ textAlign: "center" }}>
      <p>
        {" "}
        {current} / {total}{" "}
      </p>
    </div>
  );
};

URProgress.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};

export default URProgress;
