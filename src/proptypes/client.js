import PropTypes from "prop-types";

const clientPropTypes = {
  type: PropTypes.string.isRequired,
  url: PropTypes.string,
  username: PropTypes.string,
  password: PropTypes.string,
  urlError: PropTypes.string,
  usernameError: PropTypes.string,
  passwordError: PropTypes.string,
  status: PropTypes.string,
};

export default clientPropTypes;
