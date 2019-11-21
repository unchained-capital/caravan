import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  satoshisToBitcoins,
} from 'unchained-bitcoin';
import { updateDepositingAction, updateSpendingAction } from "../../actions/walletActions";
import {
  Grid, Button, Box
} from '@material-ui/core';

class WalletControl extends React.Component {
  scrollRef = React.createRef();

  static propTypes = {
    extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
  };

  componentDidMount = () => {
    this.scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }


  render = () => {
    return (
      <Grid container justify="center"  ref={this.scrollRef}>
        <Grid item md={8}>
          <h3>Balance: {this.totalBalance()}</h3>
        </Grid>
        <Grid item md={4}>
          <Box component="span">
            <Button variant="contained" color="secondary" onClick={this.setDeposit}>Deposit</Button>
          </Box>
          <Box component="span" ml={2}>
            <Button variant="contained" color="primary" onClick={this.setSpend}>Spend</Button>
          </Box>
        </Grid>
      </Grid>
    )
  }

  totalBalance() {
    const { deposits, change } = this.props;
    return satoshisToBitcoins(deposits.balanceSats.plus(change.balanceSats)).toFixed();
  }

  setDeposit = () => {
    const { setDepositing } = this.props;
    setDepositing(true);
  }
  setSpend = () => {
    const { setSpending } = this.props;
    setSpending(true);
  }
}

function mapStateToProps(state) {
  return { ...state.wallet, };
}

const mapDispatchToProps = {
  setDepositing: updateDepositingAction,
  setSpending: updateSpendingAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletControl);
