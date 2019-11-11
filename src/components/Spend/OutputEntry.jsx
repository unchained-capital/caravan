import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  satoshisToBitcoins,
  bitcoinsToSatoshis,
  validateOutputAmountBTC,
} from 'unchained-bitcoin';
import BigNumber from "bignumber.js";

// Actions
import {
  setOutputAddress,
  setOutputAmount,
  deleteOutput
} from '../../actions/transactionActions';

// Components
import { Grid, Tooltip, TextField, IconButton } from '@material-ui/core';
import { Delete, AddCircle, RemoveCircle } from '@material-ui/icons';

// Assets
import styles from './styles.module.scss';

class OutputEntry extends React.Component {

  static propTypes = {
    number: PropTypes.number.isRequired,
    inputsTotalSats: PropTypes.object.isRequired,
    outputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    fee: PropTypes.string.isRequired,
    feeError: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    amount: PropTypes.string.isRequired,
    addressError: PropTypes.string.isRequired,
    amountError: PropTypes.string.isRequired,
    finalizedOutputs: PropTypes.bool.isRequired,
    setAddress: PropTypes.func.isRequired,
    setAmount: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
  };

  render() {
    const {outputs, finalizedOutputs, address, amount, addressError, amountError} = this.props;

    return (
      <Grid container>

        <Grid item xs={7}>
          <TextField
            fullWidth
            placeholder="Address"
            name="destination"
            className={styles.outputsFormInput}
            disabled={finalizedOutputs}
            onChange={this.handleAddressChange}
            value={address}
            error={this.hasAddressError()}
            helperText={addressError}
          />
        </Grid>

        <Grid item xs={3}>
          <TextField
            fullWidth
            placeholder="Amount (BTC)"
            className={styles.outputsFormInput}
            name="amount"
            disabled={finalizedOutputs}
            onChange={this.handleAmountChange}
            value={amount}
            error={this.hasAmountError()}
            helperText={amountError}
            /* type="number" */
            /* InputProps={{ */
            /*   min: "0",  */
            /*   max: "21000000",  */
            /*   step: "0.00000001" */
            /* }} */
          />
        </Grid>

        {(!finalizedOutputs) && this.hasBalanceError() && this.isBalanceable() &&
         <Grid item xs={1}>
           <Tooltip title={`${this.balanceAction()} to ${this.autoBalancedAmount().toString()}`} placement="top">
             <small>
               <IconButton onClick={this.handleBalance}>
                 {this.balanceAction() === "Increase" ? <AddCircle /> : <RemoveCircle />}
               </IconButton>
             </small>
           </Tooltip>
         </Grid>}

        {(!finalizedOutputs) && outputs.length > 1 &&
         <Grid item xs={1}>
           <Tooltip title="Remove Output" placement="top">
             <IconButton onClick={this.handleDelete}>
               <Delete/>
             </IconButton>
           </Tooltip>
         </Grid>}

      </Grid>
    );
  }

  //
  // Address
  //

  handleAddressChange = (event) => {
    const {number, setAddress} = this.props;
    setAddress(number, event.target.value);
  }

  hasAddressError = () => {
    const {addressError} = this.props;
    return addressError !== '';
  }

  //
  // Amount
  //

  handleAmountChange = (event) => {
    const {number, setAmount} = this.props;
    setAmount(number, event.target.value);
  }

  hasAmountError = () => {
    const {amountError} = this.props;
    return amountError !== '';
  }

  //
  // Balance
  //

  isNotBalanceable = () => {
    const {number, outputs, feeError, amountError, amount, inputsTotalSats} = this.props;
    if (feeError !== '') { return true; }
    for (var i = 0; i < outputs.length; i++) {
      if (i !== (number - 1)) {
        if (outputs[i].amountError !== '' || outputs[i].amount === '') {
          return true;
        }
      }
    }
    const newAmount = this.autoBalancedAmount();
    if (validateOutputAmountBTC(newAmount, inputsTotalSats) !== '') { return true; }
    if (amountError === '' && (newAmount === new BigNumber(amount))) { return true; }
    return false;
  }

  isBalanceable = () => (!this.isNotBalanceable())

  hasBalanceError = () => {
    const {balanceError} = this.props;
    return balanceError !== '';
  }

  autoBalancedAmount = () => {
    const {number, fee, inputsTotalSats, outputs} = this.props;
    const outputTotalSats = outputs
          .filter((output, i) => i !== number - 1)
          .map((output) => bitcoinsToSatoshis(new BigNumber(output.amount)))
          .reduce(
            (accumulator, currentValue) => accumulator.plus(currentValue),
            new BigNumber(0));
    const feeSats = bitcoinsToSatoshis(new BigNumber(fee));
    return satoshisToBitcoins(inputsTotalSats.minus(outputTotalSats.plus(feeSats)));
  }

  balanceAction = () => {
    const {amount} = this.props;
    if ((!this.hasBalanceError()) || this.isNotBalanceable()) {return null; }
    return (this.autoBalancedAmount() > (new BigNumber(amount))) ? "Increase" : "Decrease";
  }

  handleBalance = () => {
    const {number, setAmount} = this.props;
    setAmount(number, this.autoBalancedAmount().toString());
  }

  //
  // State
  //

  hasError = () => {
    return this.hasAddressError() || this.hasAmountError();
  }

  handleDelete = () => {
    const {number, remove} = this.props;
    remove(number);
  }

}

function mapStateToProps(state, ownProps) {
  return {
    ...state.spend.transaction,
    ...state.spend.transaction.outputs[ownProps.number - 1],
  };
}

const mapDispatchToProps =  {
  setAddress: setOutputAddress,
  setAmount: setOutputAmount,
  remove: deleteOutput,
};

export default connect(mapStateToProps, mapDispatchToProps)(OutputEntry);
