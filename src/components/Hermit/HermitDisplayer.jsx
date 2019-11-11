import React from "react";
import PropTypes from "prop-types";

// Components
import QRCode from "qrcode.react";
import Copyable from "../Copyable";

class HermitDisplayer extends React.Component {

  static propTypes = {
    string: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
  };

  static defaultProps = {
    string: '',
    width: 120,
  }

  state = {
    errorMessage: '',
  };

  render = () => {
    const {width, string} = this.props;
    return (
      <Copyable text={string} newline={true}>
        <QRCode size={width} value={string} level={'L'} />
      </Copyable>
    );
  }

}

export default HermitDisplayer;
