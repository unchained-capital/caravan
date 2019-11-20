import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

// Components
import { Grid, Box } from '@material-ui/core';
import NetworkPicker from '../NetworkPicker';
import QuorumPicker from '../QuorumPicker';
import AddressTypePicker from '../AddressTypePicker';
import ClientPicker from '../ClientPicker';
import WalletGenerator from './WalletGenerator';
import ExtendedPublicKeyImporter from './ExtendedPublicKeyImporter';

const bip32 = require('bip32');

class CreateWallet extends React.Component {

  static propTypes = {
    totalSigners: PropTypes.number.isRequired,
  };

  static defaultProps = {
    bip32,
  }

  render = () => {
    const {visible} = this.props;
    return (
      <div>
        <h1>{visible ? 'Create' : 'Confirm'} Wallet</h1>

        <Box mt={2}>
        <Grid container spacing={3}>
          <Grid item md={8}>

            {visible && this.renderExtendedPublicKeyImporters()}

            <Box mt={2}><WalletGenerator /></Box>

          </Grid>
          <Grid item md={4}>
            <Box><QuorumPicker /></Box>
            <Box mt={2}><AddressTypePicker /></Box>
            <Box mt={2}><NetworkPicker /></Box>
            <Box mt={2}><ClientPicker /></Box>
          </Grid>
        </Grid>
      </Box>
      </div>
    );
  }

  renderExtendedPublicKeyImporters = () => {
    const {totalSigners} = this.props;
    const extendedPublicKeyImporters = [];
    for (let extendedPublicKeyImporterNum = 1; extendedPublicKeyImporterNum  <= totalSigners; extendedPublicKeyImporterNum++) {
      extendedPublicKeyImporters.push(
        <Box key={extendedPublicKeyImporterNum} mt={extendedPublicKeyImporterNum===1 ? 0 : 2}>
          <ExtendedPublicKeyImporter key={extendedPublicKeyImporterNum} number={extendedPublicKeyImporterNum} />
        </Box>
      );
    }
    return extendedPublicKeyImporters;
  }

}

function mapStateToProps(state) {
  return {
    ...{totalSigners: state.settings.totalSigners},
    ...state.quorum,
  };

}

export default connect(mapStateToProps)(CreateWallet);
