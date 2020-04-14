import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import QRCode from "qrcode.react";
import {
  Card,
  CardHeader,
  CardContent,
  TextField,
  Snackbar,
  Button,
  Box,
} from "@material-ui/core";
import { fetchAddressUTXOs } from "../../blockchain";
import {
  updateDepositSliceAction,
  resetWalletView as resetWalletViewAction,
} from "../../actions/walletActions";

// Components
import Copyable from "../Copyable";
import AddressExpander from "./AddressExpander";

let depositTimer;

class WalletDeposit extends React.Component {
  state = {
    address: "",
    amount: 0,
    amountError: "",
    showReceived: false,
    depositIndex: 0,
    node: null,
  };

  static propTypes = {
    client: PropTypes.shape({}).isRequired,
    depositNodes: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    deposits: PropTypes.shape({}).isRequired,
    network: PropTypes.string.isRequired,
    resetWalletView: PropTypes.func.isRequired,
    updateDepositSlice: PropTypes.func.isRequired,
  };

  componentDidMount() {
    this.getDepositAddress();
  }

  componentWillUnmount() {
    clearInterval(depositTimer);
  }

  getDepositableNodes = () => {
    const { depositNodes } = this.props;
    const nodes = Object.values(depositNodes.nodes);
    const depositable = [];

    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node.balanceSats.isEqualTo(0) && !node.addressUsed) {
        depositable.push(node);
      }
    }
    return depositable;
  };

  getNextDepositAddress = () => {
    const { depositIndex } = this.state;
    this.setState({ depositIndex: depositIndex + 1 });
    setTimeout(this.getDepositAddress, 0);
  };

  getDepositAddress = () => {
    const { network, client, updateDepositSlice } = this.props;
    const { depositIndex } = this.state;
    const depositableNodes = this.getDepositableNodes();
    if (depositIndex < depositableNodes.length)
      this.setState({
        node: depositableNodes[depositIndex],
        address: depositableNodes[depositIndex].multisig.address,
        showReceived: false,
      });

    clearInterval(depositTimer);
    depositTimer = setInterval(async () => {
      let updates;
      try {
        const { address } = this.state;
        updates = await fetchAddressUTXOs(address, network, client);
        if (updates && updates.utxos && updates.utxos.length) {
          clearInterval(depositTimer);
          updateDepositSlice(updates);
          this.setState({ showReceived: true });
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }, 2000);
  };

  renderAddress = () => {
    const { node } = this.state;
    return node ? <AddressExpander node={node} /> : "";
  };

  renderReceived = () => {
    const { resetWalletView } = this.props;
    const { depositIndex } = this.state;
    return (
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={this.getNextDepositAddress}
          disabled={depositIndex >= this.getDepositableNodes().length - 1}
        >
          Next Address
        </Button>
        <Box ml={2} component="span">
          <Button variant="contained" onClick={resetWalletView}>
            Return
          </Button>
        </Box>
      </Box>
    );
  };

  handleAmountChange = (event) => {
    const amount = event.target.value;
    let error = "";

    if (amount.length && !amount.match(/^[0-9.]+$/)) {
      error = "Amount must be numeric";
    }
    const decimal = amount.split(".");
    if (decimal.length > 2) {
      error = "Amount must be numeric";
    } else if (decimal.length === 2 && decimal[1].length > 8) {
      error = "Amount must have maximum precision of 8 decimal places";
    }

    this.setState({ amount: event.target.value, amountError: error });
  };

  qrString = () => {
    const { address, amount } = this.state;
    return `bitcoin:${address}${amount ? `?amount=${amount}` : ""}`;
  };

  render() {
    const { amount, amountError, showReceived } = this.state;
    return (
      <div>
        <Card>
          <CardHeader title="Deposit" />
          <CardContent>
            <Copyable text={this.qrString()} newline>
              {this.renderAddress()}
              <QRCode size={300} value={this.qrString()} level="L" />
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
            {this.renderReceived()}
          </CardContent>
        </Card>
        <Snackbar
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          open={showReceived}
          autoHideDuration={3000}
          ContentProps={{
            "aria-describedby": "message-id",
          }}
          message={
            <span id="message-id">
              Deposit received, choose Next Address to make another deposit.
            </span>
          }
        />
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.wallet,
    ...state.settings,
    depositNodes: state.wallet.deposits,
    client: state.client,
  };
}

const mapDispatchToProps = {
  updateDepositSlice: updateDepositSliceAction,
  resetWalletView: resetWalletViewAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletDeposit);
