import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  generateMultisigFromPublicKeys,
  scriptToHex,
  multisigRedeemScript,
  multisigWitnessScript,
} from 'unchained-bitcoin';
import {externalLink} from "../../utils";

// Actions
import {sortPublicKeyImporters} from "../../actions/publicKeyImporterActions";

// Components
import {
  Box, Grid, Button, Card, CardHeader,
  CardContent, FormHelperText,
} from '@material-ui/core';
import MultisigDetails from "../MultisigDetails";
import Conflict from './Conflict';

class AddressGenerator extends React.Component {

  static propTypes = {
    network: PropTypes.string.isRequired,
    totalSigners: PropTypes.number.isRequired,
    requiredSigners: PropTypes.number.isRequired,
    addressType: PropTypes.string.isRequired,
    publicKeyImporters: PropTypes.shape({}).isRequired,
    fingerprint: PropTypes.string.isRequired,
    sortPublicKeyImporters: PropTypes.func.isRequired,
  };

  render() {
    return (
      <Card>
        <CardHeader title={this.title()}/>
          <CardContent>
            {this.body()}
          </CardContent>
      </Card>
    );
  }

  body() {
    const {totalSigners} = this.props;
    if (this.publicKeyCount() === totalSigners) {
      const multisig = this.generateMultisig();

      const canonicallySorted = this.publicKeysAreCanonicallySorted();
      return (
        <div>
          {this.isInConflict() && <Conflict/>}
          {!canonicallySorted &&
           <Grid container justify="space-between">
             <Grid item md={8}>
               <FormHelperText error={true}>WARNING: These public keys are not in the standard {externalLink('https://github.com/bitcoin/bips/blob/master/bip-0067.mediawiki', 'BIP67 order')}.</FormHelperText>
             </Grid>
             <Grid item md={4}>
               <Button variant="contained" color="primary" onClick={this.canonicallySortPublicKeys}>Sort Public Keys</Button>
             </Grid>
           </Grid>
          }

          <Box mt={2}>
            <MultisigDetails multisig={multisig} />
          </Box>

          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={this.downloadAddressDetails}>Download Address Details</Button>
          </Box>


        </div>
      );
    }
    return (
      <p>
        {`Once you have imported all ${totalSigners} public keys, `}
        {'your address details will be displayed here.'}
      </p>
    );
  }


  title = () => {
    const {totalSigners, requiredSigners, addressType} = this.props;
    return (
      <Grid container justify="space-between">
        <Grid item>{requiredSigners}-of-{totalSigners} Multisig {addressType} Address</Grid>
        <Grid item><small>{`Public Keys: ${this.publicKeyCount()}/${totalSigners}`}</small></Grid>
      </Grid>
    );
  }

  isInConflict = () => {
    const { publicKeyImporters } = this.props;
    return Object.values(publicKeyImporters).some(importer => importer.conflict)
  }

  publicKeyCount = () => {
    const { publicKeyImporters } = this.props;
    return Object.values(publicKeyImporters).filter(publicKeyImporter => (publicKeyImporter.finalized)).length;
  }

  publicKeysAreCanonicallySorted = () => {
    const {publicKeyImporters} = this.props;
    const publicKeys = Object.values(publicKeyImporters).map((publicKeyImporter) => publicKeyImporter.publicKey).filter((publicKey) => publicKey !== '');
    const sortedPublicKeys = Object.values(publicKeyImporters).map((publicKeyImporter) => publicKeyImporter.publicKey).filter((publicKey) => publicKey !== '').sort(); // sort mutates the array
    const sorted = publicKeys.filter((publicKey, index) => { return publicKey === sortedPublicKeys[index];}).length === publicKeys.length;
    return sorted;
  }

  canonicallySortPublicKeys = () => {
    const {sortPublicKeyImporters} = this.props;
    sortPublicKeyImporters();
  }

  generateMultisig = () => {
    const { network, publicKeyImporters, totalSigners, requiredSigners, addressType } = this.props;
    let publicKeys = [];
    for (let publicKeyImporterNum = 1; publicKeyImporterNum <= totalSigners; publicKeyImporterNum++) {
      publicKeys.push(publicKeyImporters[publicKeyImporterNum].publicKey);
    }
    return generateMultisigFromPublicKeys(network, addressType, requiredSigners, ...publicKeys);
  }

  downloadAddressDetails = (event) => {
    event.preventDefault();
    const multisig = this.generateMultisig();
    const body = this.addressDetailsText(multisig);
    const filename = this.addressDetailsFilename(multisig);
    const blob = new Blob([body], {type: 'text/plain'});
    if(window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
  }

  addressDetailsFilename = (multisig) => {
    const {totalSigners, requiredSigners, addressType} = this.props;
    return `bitcoin-${requiredSigners}-of-${totalSigners}-${addressType}-${multisig.address}.txt`;
  }

  addressDetailsText = (multisig) => {
    const {addressType, network, totalSigners, requiredSigners} = this.props;
    const redeemScript = multisigRedeemScript(multisig);
    const witnessScript = multisigWitnessScript(multisig);
    const redeemScriptLine = (redeemScript ? `Redeem Script: ${scriptToHex(redeemScript)}` : '');
    const witnessScriptLine = (witnessScript ? `Witness Script: ${scriptToHex(witnessScript)}` : '');
    const scriptsSpacer = (redeemScript && witnessScript ? '\n\n' : '');
    return `Address: ${multisig.address}

Type: ${addressType}

Network: ${network}

Quorum: ${requiredSigners}-of-${totalSigners}

BIP32 Paths:
${this.publicKeyImporterBIP32Paths()}

${redeemScriptLine}${scriptsSpacer}${witnessScriptLine}
`;
  }

  publicKeyImporterBIP32Paths = () => {
    const {totalSigners} = this.props;
    let publicKeyImporterBIP32Paths = [];
    for (let publicKeyImporterNum = 1; publicKeyImporterNum <= totalSigners; publicKeyImporterNum++) {
      publicKeyImporterBIP32Paths.push(this.publicKeyImporterBIP32Path(publicKeyImporterNum));
    }
    return publicKeyImporterBIP32Paths.join("\n");
  }

  publicKeyImporterBIP32Path = (number) => {
    const {publicKeyImporters} =  this.props;
    const publicKeyImporter = publicKeyImporters[number];
    const bip32Path = (publicKeyImporter.method === 'text' ? 'Unknown (make sure you have written this down previously!)' : publicKeyImporter.bip32Path);
    return `  * ${publicKeyImporter.name}: ${bip32Path}`;
  }

}

function mapStateToProps(state) {
  return {
    ...state.settings,
    ...state.address,
  };
}

const mapDispatchToProps = {
  sortPublicKeyImporters,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddressGenerator);
