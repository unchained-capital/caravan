import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import { Button } from "@material-ui/core";
import Copyable from "./Copyable";

class UnsignedTransaction extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showUnsignedTransaction: false,
    };
  }

  render = () => {
    const { showUnsignedTransaction } = this.state;
    const { unsignedTransaction } = this.props;
    if (showUnsignedTransaction) {
      const hex = unsignedTransaction.toHex();
      return (
        <div>
          <small>
            <Button size="small" onClick={this.handleHideUnsignedTransaction}>
              Hide Unsigned Transaction
            </Button>
          </small>
          <p>
            <Copyable text={hex} showIcon />
          </p>
        </div>
      );
    }
    return (
      <small>
        <Button size="small" onClick={this.handleShowUnsignedTransaction}>
          Show Unsigned Transaction
        </Button>
      </small>
    );
  };

  handleShowUnsignedTransaction = () => {
    this.setState({ showUnsignedTransaction: true });
  };

  handleHideUnsignedTransaction = () => {
    this.setState({ showUnsignedTransaction: false });
  };
}

UnsignedTransaction.propTypes = {
  unsignedTransaction: PropTypes.shape({
    toHex: PropTypes.func,
  }).isRequired,
};

function mapStateToProps(state) {
  return {
    unsignedTransaction: state.spend.transaction.unsignedTransaction,
  };
}

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UnsignedTransaction);
