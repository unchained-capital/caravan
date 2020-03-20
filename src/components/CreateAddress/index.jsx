import React from 'react';
import PropTypes from 'prop-types';
import { Grid, Box } from '@material-ui/core';
import {connect} from "react-redux";

// Components
import NetworkPicker from '../NetworkPicker';
import QuorumPicker from '../QuorumPicker';
import AddressTypePicker from '../AddressTypePicker';
import AddressGenerator from './AddressGenerator';
import PublicKeyImporter from './PublicKeyImporter';
import ClientPicker from '../ClientPicker';
import BitcoindAddressImporter from '../BitcoindAddressImporter';

import '../styles.css';

class CreateAddress extends React.Component {

  static propTypes = {
    totalSigners: PropTypes.number.isRequired,
  };

  render = () => {
    const { address } = this.props
    return (
      <Box mt={2}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <h1>Address Generator</h1>
          </Grid>
          <Grid item md={8}>
              {this.renderPublicKeyImporters()}
            <Box mt={2}><AddressGenerator /></Box>
          </Grid>
          <Grid item md={4}>
            <Box><QuorumPicker /></Box>
            <Box mt={2}><AddressTypePicker /></Box>
            <Box mt={2}><NetworkPicker /></Box>
            {address !== "" && this.renderClientPicker()}
          </Grid>
        </Grid>
      </Box>
    );
  }

  renderClientPicker = () => {
    const { address } = this.props
    return (
      <Box mt={2}><ClientPicker
        publicNotes={<span>If you plan to use this address with your own bitcoind node
          you can import the address created here by switching for "Public" to "Private".
          Otherwise no action is needed here.
        </span>}
        privateNotes={<div><BitcoindAddressImporter
          addresses={[address]}/></div>}
      /></Box>

    )
  }

  renderPublicKeyImporters = () => {
    const {totalSigners} = this.props;
    const publicKeyImporters = [];
    for (let publicKeyImporterNum = 1; publicKeyImporterNum  <= totalSigners; publicKeyImporterNum++) {
      publicKeyImporters.push(
        <Box key={publicKeyImporterNum} mt={publicKeyImporterNum===1 ? 0 : 2}>
          <PublicKeyImporter number={publicKeyImporterNum} />
        </Box>
      );
    }
    return publicKeyImporters;
  }

}

function mapStateToProps(state) {
  return {
    ...{totalSigners: state.settings.totalSigners},
    ...state.address,
  };
}

export default connect(mapStateToProps)(CreateAddress);
