import PropTypes from 'prop-types';
import React       from "react";

// Components
import CopyToClipboard from 'react-copy-to-clipboard';
import {FileCopy} from '@material-ui/icons';

class Copyable extends React.Component {

  state = {
    copied: false,
    timer: null,
  };

  componentWillUnmount = () => {
    const {timer} = this.state;
    if (timer) {
      clearTimeout(timer);
    }
  }

  render = () => {
    const {newline, text, children} = this.props;
    return (
      <CopyToClipboard text={text} onCopy={this.onCopy} options={{format: "text/plain"}}>
        <span className="copyable">
          {children || text}
          {newline && <br />}
          {/* {this.props.icon && <span>&nbsp;</span>} */}
          {/* {this.props.icon && <FAIcon name="clipboard" />} */}
          {this.badge()}
        </span>
      </CopyToClipboard>
    );
  }

  badge = () => {
    const {copied} = this.state;
    if (copied) {
      //return (<span>&nbsp; <span className="badge badge-success">Copied</span></span>);
      return <FileCopy fontSize="small"/>;
    } else { return null; }
  }
  
  onCopy = () => {
    const timer = setTimeout(() => {
      this.setState({copied: false, timer: null});
    }, 1000);
    this.setState({copied: true, timer});
  }
}

Copyable.defaultProps = {
  newline: false,
  icon: true,
}

Copyable.propTypes = {
  // defaults
  newline:   PropTypes.bool.isRequired,
  icon: PropTypes.bool.isRequired,
  // parent
  text:     PropTypes.string,
  children: PropTypes.any,
};

export default Copyable;
