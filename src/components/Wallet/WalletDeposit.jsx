import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { fetchAddressUTXOs } from "../../blockchain"
import {
  updateDepositNodeAction,
} from "../../actions/walletActions";
import BigNumber from "bignumber.js";

// Components
import QRCode from "qrcode.react";
import Copyable from "../Copyable";
import {
  Card, CardHeader,
  CardContent, TextField,
} from '@material-ui/core';

let depositTimer;

class WalletDeposit extends React.Component {
  state = {
    address: "",
    bip32Path: "",
    amount: 0,
    amountError: "",
  }

  static propTypes = {
    deposits: PropTypes.object.isRequired,
    client: PropTypes.object.isRequired,
    updateDepositNode: PropTypes.func.isRequired,
  }

  componentDidMount() {
    const { deposits, network, client, updateDepositNode } = this.props;
    const nodes = Object.values(deposits.nodes)
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.balanceSats.isEqualTo(0) && !node.addressUsed) {
        this.setState({address: node.multisig.address, bip32Path: node.bip32Path});
        break;
      }
    }
    if (this.state.address === "") {
      // TODO: get more
    }

    depositTimer = setInterval(async () => {
      let utxos;
      try {
        utxos = await fetchAddressUTXOs(this.state.address, network, client);
        if (utxos.length) {
          clearInterval(depositTimer)
          const balanceSats = utxos
          .reduce(
            (accumulator, currentValue) => accumulator.plus(currentValue.amountSats),
            new BigNumber(0));

          updateDepositNode({
            change: false,
            bip32Path: this.state.bip32Path,
            utxos,
            balanceSats,
            fetchedUTXOs: true,
            fetchUTXOsError: ''
          })
        }
      } catch(e) {
        console.error(e);
      }

    }, 2000)
  }

  componentWillUnmount() {
    clearInterval(depositTimer)
  }

  render() {
    const { amount, amountError, address } = this.state;
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
            error={amountError !== ""}
            helperText={amountError}
          />
          <Copyable text={this.qrString()} newline={true}>
            <p><code>{address}</code></p>
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

    if (amount.length && !amount.match(/^[0-9.]+$/)) {
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
  return { ...state.wallet,
    ...state.settings,
    client: state.client,
  };
}

const mapDispatchToProps = {
  updateDepositNode: updateDepositNodeAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletDeposit);
