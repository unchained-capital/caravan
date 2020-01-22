import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {downloadFile} from "../../utils"

// Components
import { Grid, Box, Drawer, IconButton, Button } from '@material-ui/core';
import { Settings } from '@material-ui/icons';

import NetworkPicker from '../NetworkPicker';
import QuorumPicker from '../QuorumPicker';
import AddressTypePicker from '../AddressTypePicker';
import ClientPicker from '../ClientPicker';
import WalletGenerator from './WalletGenerator';
import ExtendedPublicKeyImporter from './ExtendedPublicKeyImporter';
import EditableName from "../EditableName";

import { updateWalletNameAction } from '../../actions/walletActions';

const bip32 = require('bip32');

class CreateWallet extends React.Component {

  static propTypes = {
    totalSigners: PropTypes.number.isRequired,
  };

  static defaultProps = {
    bip32,
  }

  state = {
    showSettings: false,
  }

  render = () => {
    const {configuring, walletName, setName, deposits} = this.props;
    return (
      <div>
        <h1>
        {!Object.values(deposits.nodes).length && <EditableName number={0} name={walletName} setName={setName} />}
        {Object.values(deposits.nodes).length > 0 && <span>{walletName}</span>}
        </h1>

        <Box mt={2}>
        <Grid container spacing={3}>
          <Grid item md={configuring ? 8 : 12}>

            {this.renderExtendedPublicKeyImporters()}

            <Box mt={2}><WalletGenerator downloadWalletDetails={this.downloadWalletDetails} /></Box>

          </Grid>
          {this.renderSettings()}
        </Grid>
      </Box>
      </div>
    );
  }

  renderSettings = () => {
    const {configuring} = this.props;
    if (configuring)
      return (
        <Grid item md={4}>
          <Box><QuorumPicker /></Box>
          <Box mt={2}><AddressTypePicker /></Box>
          <Box mt={2}><NetworkPicker /></Box>
          <Box mt={2}><ClientPicker /></Box>
        </Grid>
      )
    else return (
      <div>
      <Box position="fixed" right={10}>
        <IconButton onClick={this.toggleDrawer}>
          <Settings/>
        </IconButton>
      </Box>
      <Drawer md={4} anchor="right" open={this.state.showSettings} onClose={this.toggleDrawer}>
        <Box  width={400}>

          <Box mt={2}><ClientPicker /></Box>
          <Box mt={2} textAlign={"center"}><Button variant="contained" color="primary" onClick={this.downloadWalletDetails}>Download Wallet Details</Button></Box>
        </Box>
      </Drawer>

      </div>
      )
  }

  toggleDrawer = () => {
    this.setState({showSettings: !this.state.showSettings})
  }

  renderExtendedPublicKeyImporters = () => {
    const {totalSigners, configuring} = this.props;
    const extendedPublicKeyImporters = [];
    for (let extendedPublicKeyImporterNum = 1; extendedPublicKeyImporterNum  <= totalSigners; extendedPublicKeyImporterNum++) {
      extendedPublicKeyImporters.push(
        <Box key={extendedPublicKeyImporterNum} mt={extendedPublicKeyImporterNum===1 ? 0 : 2} display={configuring ? 'block' : 'none'}>
          <ExtendedPublicKeyImporter key={extendedPublicKeyImporterNum} number={extendedPublicKeyImporterNum} />
        </Box>
      );
    }
    return extendedPublicKeyImporters;
  }

  downloadWalletDetails = (event) => {
    event.preventDefault();
    const body = this.walletDetailsText();
    const filename = this.walletDetailsFilename();
    downloadFile(body, filename)
  }

  walletDetailsText = () => {
    const {addressType, network, totalSigners, requiredSigners, walletName} = this.props;
    return `Wallet: ${walletName}

Type: ${addressType}

Network: ${network}

Quorum: ${requiredSigners}-of-${totalSigners}

BIP32 Paths:
${this.extendedPublicKeyImporterBIP32Paths()}
`

  }

  extendedPublicKeyImporterBIP32Paths = () => {
    const {totalSigners} = this.props;
    let extendedPublicKeyImporterBIP32Paths = [];
    for (let extendedPublicKeyImporterNum = 1; extendedPublicKeyImporterNum <= totalSigners; extendedPublicKeyImporterNum++) {
      extendedPublicKeyImporterBIP32Paths.push(this.extendedPublicKeyImporterBIP32Path(extendedPublicKeyImporterNum));
    }
    return extendedPublicKeyImporterBIP32Paths.join("\n");
  }

  extendedPublicKeyImporterBIP32Path = (number) => {
    const {extendedPublicKeyImporters} =  this.props;
    const extendedPublicKeyImporter = extendedPublicKeyImporters[number];
    const bip32Path = (extendedPublicKeyImporter.method === 'text' ? 'Unknown (make sure you have written this down previously!)' : extendedPublicKeyImporter.bip32Path);
    return `  * ${extendedPublicKeyImporter.name}: ${bip32Path}: ${extendedPublicKeyImporter.extendedPublicKey}`;
  }

  walletDetailsFilename = () => {
    const {totalSigners, requiredSigners, addressType, walletName} = this.props;
    return `bitcoin-${requiredSigners}-of-${totalSigners}-${addressType}-${walletName}.txt`;

  }

}

function mapStateToProps(state) {
  return {
    ...state.settings,
    ...state.quorum,
    ...{walletName: state.wallet.info.walletName},
    ...state.wallet,
  };
}

const mapDispatchToProps = {
  setName: updateWalletNameAction
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateWallet);
