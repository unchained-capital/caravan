import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Copyable from "./Copyable";
import { Button } from "@material-ui/core";

class UnsignedTransaction extends React.Component {

  static propTypes = {
    unsignedTransaction: PropTypes.object.isRequired,
  };

  state = {
    showUnsignedTransaction: false,
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
          <p><Copyable text={hex}><code>{hex}</code></Copyable></p>
        </div>

      );
    } else {
      return (
        <small>
          <Button size="small" onClick={this.handleShowUnsignedTransaction}>
            Show Unsigned Transaction
              </Button>
        </small>
      );
    }
  }

  handleShowUnsignedTransaction = () => {
    this.setState({ showUnsignedTransaction: true });
  }

  handleHideUnsignedTransaction = () => {
    this.setState({ showUnsignedTransaction: false });
  }

}

function mapStateToProps(state) {
  return {
    unsignedTransaction: state.spend.transaction.unsignedTransaction,
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(UnsignedTransaction);
