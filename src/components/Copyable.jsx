import PropTypes from "prop-types";
import React from "react";

// Components
import CopyToClipboard from "react-copy-to-clipboard";
import { FileCopy } from "@material-ui/icons";

class Copyable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      copied: false,
      timer: null,
    };
  }

  componentWillUnmount = () => {
    const { timer } = this.state;
    if (timer) {
      clearTimeout(timer);
    }
  };

  render = () => {
    const { newline, text, children } = this.props;
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
      <span onClick={(e) => e.stopPropagation()}>
        <CopyToClipboard
          text={text}
          onCopy={this.onCopy}
          options={{ format: "text/plain" }}
        >
          <span className="copyable">
            {children || text}
            {newline && <br />}
            {this.badge()}
          </span>
        </CopyToClipboard>
      </span>
    );
  };

  badge = () => {
    const { copied } = this.state;
    if (copied) {
      return <FileCopy fontSize="small" />;
    }
    return null;
  };

  onCopy = () => {
    const timer = setTimeout(() => {
      this.setState({ copied: false, timer: null });
    }, 1000);
    this.setState({ copied: true, timer });
  };
}

Copyable.propTypes = {
  // defaults
  newline: PropTypes.bool,
  // parent
  text: PropTypes.string.isRequired,
  children: PropTypes.node,
};

Copyable.defaultProps = {
  newline: false,
  children: React.createElement("span"),
};
export default Copyable;
