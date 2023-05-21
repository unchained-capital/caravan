import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  satoshisToBitcoins,
  bitcoinsToSatoshis,
  validateOutputAmount,
} from "unchained-bitcoin";
import BigNumber from "bignumber.js";
import {
  Grid,
  Tooltip,
  TextField,
  IconButton,
  InputAdornment,
  FormHelperText,
  Typography,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWallet";
import { Delete, AddCircle, RemoveCircle } from "@mui/icons-material";
import {
  setOutputAddress,
  setOutputAmount,
  deleteOutput,
  setChangeOutputIndex,
  setMaxSpendOnOutput,
} from "../../actions/transactionActions";
import styles from "./styles.module.scss";

class OutputEntry extends React.Component {
  displayBalanceAction = () => {
    const { isWallet, finalizedOutputs, autoSpend } = this.props;
    if (isWallet) {
      return (
        !autoSpend &&
        !finalizedOutputs &&
        this.hasBalanceError() &&
        this.isBalanceable()
      );
    }
    return !finalizedOutputs && this.hasBalanceError() && this.isBalanceable();
  };

  //
  // Address
  //

  addChangeAddress = () => {
    const { changeNode, number, setAddress, setChangeOutput } = this.props;
    setAddress(number, changeNode.multisig.address);
    setChangeOutput(number);
  };

  renderChangeAdornment = () => {
    const {
      changeNode,
      number,
      changeOutputIndex,
      address,
      isWallet,
      autoSpend,
    } = this.props;
    if (isWallet && autoSpend) return {};
    if (changeNode !== null) {
      let title;
      let disable = false;
      if (changeOutputIndex === 0 && address === "") {
        title = "Set to wallet change address";
      } else if (number === changeOutputIndex) {
        title = "Your change will go here.";
        disable = true;
      } else return {};
      return {
        /* min: "0", */
        /* max: "1000", */
        /* step: "any", */
        endAdornment: (
          <InputAdornment position="end">
            <Tooltip placement="top" title={title}>
              <small>
                <IconButton onClick={this.addChangeAddress} disabled={disable}>
                  <AccountBalanceWalletOutlinedIcon />
                </IconButton>
              </small>
            </Tooltip>
          </InputAdornment>
        ),
      };
    }
    return {};
  };

  handleAddressChange = (event) => {
    const { number, setAddress } = this.props;
    setAddress(number, event.target.value);
  };

  hasAddressError = () => {
    const { addressError } = this.props;
    return addressError !== "";
  };

  //
  // Amount
  //

  handleAmountChange = (event) => {
    const { number, setAmount } = this.props;
    setAmount(number, event.target.value);
  };

  hasAmountError = () => {
    const { amountError } = this.props;
    return amountError !== "";
  };

  //
  // Balance
  //

  isNotBalanceable = () => {
    const { number, outputs, feeError, amountError, amount, inputsTotalSats } =
      this.props;
    if (feeError !== "") {
      return true;
    }
    for (let i = 0; i < outputs.length; i += 1) {
      if (i !== number - 1) {
        if (outputs[i].amountError !== "" || outputs[i].amount === "") {
          return true;
        }
      }
    }
    const newAmount = this.autoBalancedAmount();
    if (
      validateOutputAmount(bitcoinsToSatoshis(newAmount), inputsTotalSats) !==
      ""
    ) {
      return true;
    }
    return amountError === "" && newAmount === new BigNumber(amount);
  };

  isBalanceable = () => !this.isNotBalanceable();

  hasBalanceError = () => {
    const { balanceError } = this.props;
    return balanceError !== "";
  };

  autoBalancedAmount = () => {
    const { number, fee, inputsTotalSats, outputs } = this.props;
    const outputTotalSats = outputs
      .filter((output, i) => i !== number - 1)
      .map((output) => output.amountSats)
      .reduce(
        (accumulator, currentValue) => accumulator.plus(currentValue),
        new BigNumber(0)
      );
    const feeSats = bitcoinsToSatoshis(new BigNumber(fee));
    return satoshisToBitcoins(
      inputsTotalSats.minus(outputTotalSats.plus(feeSats))
    );
  };

  balanceAction = () => {
    const { balanceError } = this.props;
    if (!this.hasBalanceError() || this.isNotBalanceable()) {
      return null;
    }
    return balanceError.split(" ")[0];
  };

  handleBalance = () => {
    const { number, setAmount } = this.props;
    setAmount(number, this.autoBalancedAmount().toString());
  };

  //
  // State
  //

  hasError = () => {
    return this.hasAddressError() || this.hasAmountError();
  };

  handleDelete = () => {
    const { number, remove } = this.props;
    remove(number);
  };

  handleMaxSpend = (e) => {
    e.preventDefault();
    const { number, setMaxSpend } = this.props;
    setMaxSpend(number);
  };

  render() {
    const {
      outputs,
      finalizedOutputs,
      address,
      amount,
      addressError,
      amountError,
      changeOutputIndex,
      autoSpend,
      isWallet,
      number,
    } = this.props;

    const gridSpacing = isWallet ? 10 : 1;

    return (
      <Grid container spacing={gridSpacing}>
        <Grid item xs={7}>
          <TextField
            fullWidth
            placeholder="Address"
            name="destination"
            className={styles.outputsFormInput}
            disabled={finalizedOutputs}
            onChange={this.handleAddressChange}
            value={address}
            variant="standard"
            error={this.hasAddressError()}
            helperText={addressError}
            InputProps={this.renderChangeAdornment()}
          />
        </Grid>

        <Grid item xs={3}>
          <TextField
            fullWidth
            placeholder="Amount"
            className={styles.outputsFormInput}
            name="amount"
            disabled={finalizedOutputs}
            onChange={this.handleAmountChange}
            value={amount}
            variant="standard"
            error={this.hasAmountError()}
            helperText={amountError}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {isWallet &&
                    autoSpend &&
                    number === outputs.length &&
                    number !== changeOutputIndex && (
                      <Typography
                        onClick={this.handleMaxSpend}
                        className={styles.maxSpend}
                        style={{ fontSize: ".7rem" }}
                      >
                        MAX
                      </Typography>
                    )}
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <FormHelperText>BTC</FormHelperText>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        {this.displayBalanceAction() && (
          <Grid item xs={1}>
            <Tooltip
              title={`${this.balanceAction()} to ${this.autoBalancedAmount().toString()}`}
              placement="top"
            >
              <small>
                <IconButton onClick={this.handleBalance}>
                  {this.balanceAction() === "Increase" ? (
                    <AddCircle />
                  ) : (
                    <RemoveCircle />
                  )}
                </IconButton>
              </small>
            </Tooltip>
          </Grid>
        )}

        {!finalizedOutputs &&
          outputs.length > (changeOutputIndex > 0 && autoSpend ? 2 : 1) && (
            <Grid item xs={1}>
              <Tooltip title="Remove Output" placement="top">
                <IconButton onClick={this.handleDelete}>
                  <Delete />
                </IconButton>
              </Tooltip>
            </Grid>
          )}
      </Grid>
    );
  }
}

OutputEntry.propTypes = {
  address: PropTypes.string.isRequired,
  addressError: PropTypes.string.isRequired,
  amount: PropTypes.string.isRequired,
  amountError: PropTypes.string.isRequired,
  autoSpend: PropTypes.bool.isRequired,
  balanceError: PropTypes.string.isRequired,
  changeNode: PropTypes.shape({
    multisig: PropTypes.shape({
      address: PropTypes.string,
    }),
  }),
  changeOutputIndex: PropTypes.number.isRequired,
  fee: PropTypes.string.isRequired,
  feeError: PropTypes.string.isRequired,
  finalizedOutputs: PropTypes.bool.isRequired,
  inputsTotalSats: PropTypes.shape({
    minus: PropTypes.func,
  }).isRequired,
  isWallet: PropTypes.bool.isRequired,
  number: PropTypes.number.isRequired,
  outputs: PropTypes.arrayOf(
    PropTypes.shape({
      amount: PropTypes.string,
      amountError: PropTypes.string.isRequired,
    })
  ).isRequired,
  remove: PropTypes.func.isRequired,
  setAddress: PropTypes.func.isRequired,
  setAmount: PropTypes.func.isRequired,
  setMaxSpend: PropTypes.func.isRequired,
  setChangeOutput: PropTypes.func.isRequired,
};

OutputEntry.defaultProps = {
  changeNode: {},
};

function mapStateToProps(state, ownProps) {
  return {
    ...state.spend.transaction,
    ...state.spend.transaction.outputs[ownProps.number - 1],
    changeNode: state.wallet.change.nextNode,
  };
}

const mapDispatchToProps = {
  setAddress: setOutputAddress,
  setAmount: setOutputAmount,
  remove: deleteOutput,
  setChangeOutput: setChangeOutputIndex,
  setMaxSpend: setMaxSpendOnOutput,
};

export default connect(mapStateToProps, mapDispatchToProps)(OutputEntry);
