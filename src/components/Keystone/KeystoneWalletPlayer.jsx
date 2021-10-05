import React from "react";
import PropTypes from "prop-types";
import { KeystoneWalletPlayer as Interaction } from "unchained-wallets";
import KeystoneRawPlayer from "./KeystoneRawPlayer";

const KeystoneWalletPlayer = (props) => {
  const { data, ...rest } = props;
  const urEncoder = new Interaction().encode(data);
  return <KeystoneRawPlayer {...rest} urEncoder={urEncoder} />;
};

KeystoneWalletPlayer.propTypes = {
  startText: PropTypes.string.isRequired,
  data: PropTypes.string.isRequired,
  buttonStyle: PropTypes.shape({
    variant: PropTypes.string,
    color: PropTypes.string,
    withIcon: PropTypes.bool,
  }),
  title: PropTypes.string,
  description: PropTypes.string,
  renderDescription: PropTypes.func,
};

KeystoneWalletPlayer.defaultProps = {
  buttonStyle: {
    variant: "contained",
    color: "primary",
    withIcon: false,
  },
  title: "",
  description: "",
  renderDescription: () => null,
};

export default KeystoneWalletPlayer;
