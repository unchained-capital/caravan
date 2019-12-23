import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { fetchAddressUTXOs } from "../../blockchain"
import {
  updateDepositNodeAction,
  resetWalletView,
} from "../../actions/walletActions";
import BigNumber from "bignumber.js";

// Components
import QRCode from "qrcode.react";
import Copyable from "../Copyable";
import {
  Card, CardHeader,
  CardContent, TextField,
  Snackbar,
  Button,
  Box,
} from '@material-ui/core';

let depositTimer;

class WalletDeposit extends React.Component {
  state = {
    address: "",
    bip32Path: "",
    amount: 0,
    amountError: "",
    showReceived: false,
  }

  static propTypes = {
    deposits: PropTypes.object.isRequired,
    client: PropTypes.object.isRequired,
    updateDepositNode: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.getDepositAddress()
  }

  componentWillUnmount() {
    clearInterval(depositTimer)
  }

  getDepositAddress = () => {
    const { depositNode, network, client, updateDepositNode } = this.props;

    this.setState({address: depositNode.multisig.address, bip32Path: depositNode.bip32Path, showReceived: false});

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
          this.setState({showReceived: true});
          // setTimeout(resetWalletView, 5000);
        }
      } catch(e) {
        console.error(e);
      }

    }, 2000)
  }

  render() {
    const { amount, amountError, address, showReceived } = this.state;
    return (
      <div>
        <Card>
          <CardHeader title="Deposit"/>
          <CardContent>
            <Copyable text={this.qrString()} newline={true}>
              <p><code>{address}</code></p>
              <QRCode size={300} value={this.qrString()} level={'L'} />
              <p>Scan QR code or click to copy address to clipboard.</p>
            </Copyable>
            <TextField
              fullWidth
              label="Amount BTC"
              name="depositAmount"
              onChange={this.handleAmountChange}
              value={amount}
              error={amountError !== ""}
              helperText={amountError}
            />
            { this.renderReceived() }
          </CardContent>
        </Card>
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          open={showReceived}
          autoHideDuration={3000}
          // onClose={() => this.setState({showReceived: false})}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id">Deposit received</span>}
        />
      </div>
    )
  }

  renderReceived = () => {
    const { showReceived } = this.state;
    const { resetWalletView } = this.props;
    if (showReceived) {
      return (
        <Box mt={2}>
          <Button variant="contained" color="primary" onClick={this.getDepositAddress}>Make another deposit</Button>
          <Box ml={2} component="span">
            <Button variant="contained" onClick={resetWalletView}>Return</Button>
          </Box>
        </Box>
      )
    }
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
  return {
    ...state.wallet,
    ...state.settings,
    depositNode: state.wallet.deposits.nextNode,
    client: state.client,
  };
}

const mapDispatchToProps = {
  updateDepositNode: updateDepositNodeAction,
  resetWalletView,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletDeposit);
