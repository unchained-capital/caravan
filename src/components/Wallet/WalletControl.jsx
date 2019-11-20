import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  satoshisToBitcoins,
} from 'unchained-bitcoin';

import {
  Grid, Button, Box
} from '@material-ui/core';

class WalletControl extends React.Component {

  static propTypes = {
    extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
  };

  render() {
    return (
      <Grid container justify="center">
        <Grid item md={8}>
          <h3>Balance: {this.totalBalance()}</h3>
        </Grid>
        <Grid item md={4}>
          <Box>
            <Button variant="contained" color="secondary">Deposit</Button>
          </Box>
          <Box mt={2}>
            <Button variant="contained" color="primary">Spend</Button>
          </Box>
        </Grid>
      </Grid>
    )
  }

  totalBalance() {
    const { deposits, change } = this.props;
    return satoshisToBitcoins(deposits.balanceSats.plus(change.balanceSats)).toFixed();
  }



}

function mapStateToProps(state) {
  return { ...state.wallet, };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(WalletControl);
