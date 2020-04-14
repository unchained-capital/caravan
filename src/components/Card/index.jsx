import React from "react";
import PropTypes from "prop-types";
import "./styles.css";

const Card = (props) => {
  const { title, children } = props;

  return (
    <div className="card custom-card">
      <div className="card-header">
        <h5>{title}</h5>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.element.isRequired,
};

export default Card;
