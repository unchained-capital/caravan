import PropTypes from "prop-types";

export const bigNumberPropTypes = {
  c: PropTypes.arrayOf(PropTypes.number).isRequired,
  e: PropTypes.number.isRequired,
  s: PropTypes.number.isRequired,
};

export default {
  bigNumberPropTypes,
};
