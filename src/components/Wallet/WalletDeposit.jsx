import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import QRCode from "qrcode.react";
import {
  Button,
  Box,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Typography,
  TextField,
} from "@mui/material";
import { enqueueSnackbar } from "notistack";

import { fetchAddressUTXOs } from "../../blockchain";
import {
  updateDepositSliceAction,
  resetWalletView as resetWalletViewAction,
} from "../../actions/walletActions";
import { getDepositableSlices } from "../../selectors/wallet";
import { slicePropTypes } from "../../proptypes";

// Components
import Copyable from "../Copyable";
import BitcoinIcon from "../BitcoinIcon";
import SlicesTable from "../Slices/SlicesTable";

let depositTimer;

class WalletDeposit extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      address: "",
      amount: 0,
      amountError: "",
      depositIndex: 0,
      slice: null,
    };
  }

  componentDidMount() {
    this.getDepositAddress();
  }

  componentWillUnmount() {
    clearInterval(depositTimer);
  }

  getNextDepositAddress = () => {
    const { depositIndex } = this.state;
    this.setState({ depositIndex: depositIndex + 1 });
    setTimeout(this.getDepositAddress, 0);
  };

  getDepositAddress = () => {
    const { network, client, updateDepositSlice, depositableSlices } =
      this.props;
    const { depositIndex } = this.state;

    if (depositIndex < depositableSlices.length)
      this.setState({
        slice: depositableSlices[depositIndex],
        address: depositableSlices[depositIndex].multisig.address,
      });

    clearInterval(depositTimer);
    depositTimer = setInterval(async () => {
      let updates;
      try {
        const { address, slice } = this.state;
        updates = await fetchAddressUTXOs(address, network, client);
        if (updates && updates.utxos && updates.utxos.length) {
          clearInterval(depositTimer);
          updateDepositSlice({ ...updates, bip32Path: slice.bip32Path });
          enqueueSnackbar(
            "Deposit received. A new address should now be available for deposit."
          );
          this.resetDepositAddressIndex();
          setTimeout(this.getDepositAddress, 2000);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }, 2000);
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

  resetDepositAddressIndex = () => {
    const { depositableSlices } = this.props;
    this.setState({
      slice: depositableSlices[0],
      address: depositableSlices[0].multisig.address,
      depositIndex: 0,
    });
  };

  render() {
    const { client, network, depositableSlices } = this.props;
    const { address, amount, amountError, depositIndex, slice } = this.state;

    return (
      <div>
        <Card>
          <CardContent>
            <Grid
              container
              justifyContent="center"
              direction="column"
              alignItems="center"
            >
              <Grid item md={6}>
                <Copyable text={address} newline showText={false}>
                  <QRCode size={300} value={this.qrString()} level="L" />
                </Copyable>
              </Grid>
              <Grid item>
                <Typography align="center" variant="subtitle1">
                  Scan QR code or click to copy address to clipboard.
                </Typography>
              </Grid>
              <Grid item md={6}>
                <Box my={3}>
                  <TextField
                    fullWidth
                    label="Amount BTC"
                    name="depositAmount"
                    onChange={this.handleAmountChange}
                    value={amount}
                    error={amountError !== ""}
                    helperText={amountError}
                    variant="standard"
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <BitcoinIcon network={network} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
            {slice ? (
              <SlicesTable
                slices={[slice]}
                client={client}
                network={network}
                disabled={["lastUsed"]}
              />
            ) : (
              ""
            )}
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.getNextDepositAddress}
                disabled={depositIndex >= depositableSlices.length - 1}
              >
                Next Address
              </Button>
            </Box>
          </CardContent>
        </Card>
      </div>
    );
  }
}

WalletDeposit.propTypes = {
  client: PropTypes.shape({}).isRequired,
  depositableSlices: PropTypes.arrayOf(PropTypes.shape(slicePropTypes))
    .isRequired,
  network: PropTypes.string.isRequired,
  updateDepositSlice: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    ...state.settings,
    depositableSlices: getDepositableSlices(state),
    client: state.client,
  };
}

const mapDispatchToProps = {
  updateDepositSlice: updateDepositSliceAction,
  resetWalletView: resetWalletViewAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletDeposit);
