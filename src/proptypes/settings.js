import PropTypes from "prop-types";

const settingsPropTypes = {
  network: PropTypes.string,
  totalSigners: PropTypes.number,
  requiredSigners: PropTypes.number,
  addressType: PropTypes.string,
  frozen: PropTypes.bool,
};

export default settingsPropTypes;
