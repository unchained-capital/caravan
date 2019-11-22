import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Components
import QRCode from "qrcode.react";
import Copyable from "../Copyable";
import {
  Card, CardHeader,
  CardContent, TextField,
} from '@material-ui/core';

class WalletDeposit extends React.Component {
  state = {
    address: "",
    amount: 0,
    amountError: "",
  }

  static propTypes = {
    deposits: PropTypes.object.isRequired
  }

  componentDidMount() {
    const { deposits } = this.props;
    const nodes = Object.values(deposits.nodes)
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.balanceSats.isEqualTo(0)) {
        this.setState({address: node.multisig.address});
        break;
      }
    }
    if (this.state.address === "") {
      // TODO: get more
    }
  }

  render() {
    const { address, amount, amountError } = this.state;
    return (
      <Card>
        <CardHeader title="Deposit"/>
        <CardContent>
        <TextField
            fullWidth
            label="Amount"
            name="depositAmount"
            onChange={this.handleAmountChange}
            value={amount}
            error={amountError != ""}
            helperText={amountError}
          />
          <Copyable text={this.qrString()} newline={true}>
            <QRCode size={300} value={this.qrString()} level={'L'} />
            <p>Scan QR code or click to copy address to clipboard.</p>
          </Copyable>
        </CardContent>
      </Card>
    )
  }

  handleAmountChange = (event)=> {
    const amount = event.target.value;
    let error = ""

    if (amount.length && !amount.match(/^[0-9\.]+$/)) {
      error = "Amount must be numeric";
    }
    const decimal = amount.split('.');
    if (decimal.length > 2) {
      error = "Amount must be numeric";
    } else if (decimal.length === 2 && decimal[1].length > 8) {
      error = "Amount must have maximum precision of 8 decimal places";
    }

    this.setState({amount: event.target.value, amountError: error})
  }

  qrString = () => {
    const {address, amount} = this.state;
    return `bitcoin:${address}${amount ? '?amount='+amount : ''}`
  }

}

function mapStateToProps(state) {
  return { ...state.wallet, };
}

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(WalletDeposit);
