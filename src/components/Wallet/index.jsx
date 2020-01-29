import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
import {downloadFile} from "../../utils"

// Components
import { Grid, Box, Drawer, IconButton, Button, Card, TextField, CardHeader, CardContent } from '@material-ui/core';
import { Settings } from '@material-ui/icons';

import NetworkPicker from '../NetworkPicker';
import QuorumPicker from '../QuorumPicker';
import AddressTypePicker from '../AddressTypePicker';
import ClientPicker from '../ClientPicker';
import WalletGenerator from './WalletGenerator';
import ExtendedPublicKeyImporter from './ExtendedPublicKeyImporter';
import EditableName from "../EditableName";

// Actions
import {
  setTotalSigners,
  setRequiredSigners,
  setAddressType,
  setNetwork,
} from "../../actions/settingsActions";
import { updateWalletNameAction } from '../../actions/walletActions';
import { setExtendedPublicKeyImporterMethod, setExtendedPublicKeyImporterExtendedPublicKey,
  setExtendedPublicKeyImporterBIP32Path, setExtendedPublicKeyImporterName,
  setExtendedPublicKeyImporterFinalized
} from '../../actions/extendedPublicKeyImporterActions';
import { ExportPublicKey } from 'unchained-wallets';

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
    configError: "",
    configJson: "",
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

            {this.renderWalletImporter()}

            {this.renderExtendedPublicKeyImporters()}

            <Box mt={2}><WalletGenerator downloadWalletDetails={this.downloadWalletDetails} /></Box>

          </Grid>
          {this.renderSettings()}
        </Grid>
      </Box>
      </div>
    );
  }

  handleConfigChange = (event) => {
    const configJson = event.target.value;
    try {
      JSON.parse(configJson);
      this.setState({configError: ""});

      // TODO: validate fields

    } catch(parseError) {
      this.setState({configError: "Invlaid JSON"});
    }
    this.setState({configJson: configJson});
  }

  importDetails = () => {
    const { configJson } = this.state;
    const { setTotalSigners, setRequiredSigners,setAddressType,
      setNetwork, setExtendedPublicKeyImporterMethod, setExtendedPublicKeyImporterExtendedPublicKey,
      setExtendedPublicKeyImporterBIP32Path, setExtendedPublicKeyImporterFinalized,
      setExtendedPublicKeyImporterName, updateWalletNameAction } = this.props;

    const walletConfiguration = JSON.parse(configJson);
    setTotalSigners(walletConfiguration.quorum.totalSigners);
    setRequiredSigners(walletConfiguration.quorum.requiredSigners);
    setAddressType(walletConfiguration.addressType);
    setNetwork(walletConfiguration.network);
    updateWalletNameAction(0, walletConfiguration.name);
    walletConfiguration.extendedPublicKeys.forEach((extendedPublicKey, index) => {
      const number = index + 1
      setExtendedPublicKeyImporterName(number, extendedPublicKey.name);
      setExtendedPublicKeyImporterMethod(number, extendedPublicKey.method);
      setExtendedPublicKeyImporterBIP32Path(number, extendedPublicKey.bip32Path);
      setExtendedPublicKeyImporterExtendedPublicKey(number, extendedPublicKey.xpub);
      setExtendedPublicKeyImporterFinalized(number, true);
    })
  }

  renderWalletImporter = () => {
    const { configJson, configError } = this.state;
    const {configuring} = this.props;

    if (configuring)
      return (
        <Card>
          <CardHeader title="Import Configuration" />
          <CardContent>
              <TextField
                fullWidth
                multiline
                // autoFocus
                variant="outlined"
                label="Configuration"
                value={configJson}
                rows={5}
                onChange={this.handleConfigChange}
                helperText={configError}
                error={configError!==''}
              />
              <Box mt={2} textAlign={"center"}>
                <Button variant="contained" color="primary" disabled={configError!==''} onClick={this.importDetails}>Import Wallet Configuration</Button>
              </Box>
          </CardContent>
        </Card>
      );
    return "";
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
          <Box mt={2} textAlign={"center"}><Button variant="contained" color="primary" onClick={this.downloadWalletDetails}>Export Wallet Details</Button></Box>
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
    return `{
  "name": "${walletName}",
  "addressType": "${addressType}",
  "network": "${network}",
  "quorum": {
    "requiredSigners": ${requiredSigners},
    "totalSigners":${totalSigners}
  },
  "extendedPublicKeys": [
${this.extendedPublicKeyImporterBIP32Paths()}
  ]
}
`

  }

  extendedPublicKeyImporterBIP32Paths = () => {
    const {totalSigners} = this.props;
    let extendedPublicKeyImporterBIP32Paths = [];
    for (let extendedPublicKeyImporterNum = 1; extendedPublicKeyImporterNum <= totalSigners; extendedPublicKeyImporterNum++) {
      extendedPublicKeyImporterBIP32Paths
        .push(`${this.extendedPublicKeyImporterBIP32Path(extendedPublicKeyImporterNum)}${extendedPublicKeyImporterNum < totalSigners ? ',' : ''}`);
    }
    return extendedPublicKeyImporterBIP32Paths.join("\n");
  }

  extendedPublicKeyImporterBIP32Path = (number) => {
    const {extendedPublicKeyImporters} =  this.props;
    const extendedPublicKeyImporter = extendedPublicKeyImporters[number];
    const bip32Path = (extendedPublicKeyImporter.method === 'text' ? 'Unknown (make sure you have written this down previously!)' : extendedPublicKeyImporter.bip32Path);
    return `    {
      "name": "${extendedPublicKeyImporter.name}",
      "bip32Path": "${bip32Path}",
      "xpub": "${extendedPublicKeyImporter.extendedPublicKey}",
      "method": "${extendedPublicKeyImporter.method}"
    }`
  }

  walletDetailsFilename = () => {
    const {totalSigners, requiredSigners, addressType, walletName} = this.props;
    return `bitcoin-${requiredSigners}-of-${totalSigners}-${addressType}-${walletName}.json`;

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
  setName: updateWalletNameAction,
  setTotalSigners,
  setRequiredSigners,
  setAddressType,
  setNetwork,
  setExtendedPublicKeyImporterMethod,
  setExtendedPublicKeyImporterExtendedPublicKey,
  setExtendedPublicKeyImporterBIP32Path,
  setExtendedPublicKeyImporterName,
  setExtendedPublicKeyImporterFinalized,
  updateWalletNameAction
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateWallet);
