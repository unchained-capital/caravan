import React from 'react';
import BigNumber from "bignumber.js";
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  deriveChildPublicKey,
  generateMultisigFromPublicKeys,
} from 'unchained-bitcoin';
import {
  fetchAddressUTXOs,
  getAddressStatus,
} from "../../blockchain";

// Components
import {
  Button, Card, CardHeader,
  CardContent, Box
} from '@material-ui/core';
import ConfirmWallet from './ConfirmWallet';
import WalletControl from './WalletControl';
import WalletDeposit from './WalletDeposit';
import WalletSpend from './WalletSpend';
import WalletView from './WalletView';

// Actions
import {setFrozen} from "../../actions/settingsActions";
import {
  updateDepositNodeAction,
  updateChangeNodeAction,
  updateAutoSpendAction,
} from "../../actions/walletActions";
import {setExtendedPublicKeyImporterVisible} from "../../actions/extendedPublicKeyImporterActions";
import { setIsWallet } from "../../actions/transactionActions";
import {downloadFile} from "../../utils"

const MAX_TRAILING_EMPTY_NODES = 20;
const MAX_FETCH_UTXOS_ERRORS = 5;

class WalletGenerator extends React.Component {

  static propTypes = {
    network: PropTypes.string.isRequired,
    addressType: PropTypes.string.isRequired,
    client: PropTypes.object.isRequired,
    extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
    totalSigners: PropTypes.number.isRequired,
    requiredSigners: PropTypes.number.isRequired,
    deposits: PropTypes.object.isRequired,
    change: PropTypes.object.isRequired,
    freeze: PropTypes.func.isRequired,
    updateDepositNode: PropTypes.func.isRequired,
    updateChangeNode: PropTypes.func.isRequired,
    setIsWallet: PropTypes.func.isRequired,
  };

  state = {
    generating: false,
  };

  render() {
    return (
      <div>
        <Card>
          <CardHeader title={this.title()}/>
          <CardContent>
          {this.body()}
          </CardContent>
        </Card>
        <Box mt={2}>
          {this.renderModeComponent()}
        </Box>
      </div>
    );
  }

  componentDidMount() {
    const { setIsWallet } = this.props
    setIsWallet();
  }

  title = () => {
    const {totalSigners, requiredSigners} = this.props;
    return (
      <span className="justify-content-between d-flex">
        Your {requiredSigners}-of-{totalSigners} P2SH Multisig Wallet
        <small className="text-muted">{` Extended Public Keys: ${this.extendedPublicKeyCount()}/${totalSigners}`}</small>
      </span>
    );
  }

  extendedPublicKeyCount = () => {
    const { extendedPublicKeyImporters } = this.props;
    return Object.values(extendedPublicKeyImporters).filter(extendedPublicKeyImporter => (extendedPublicKeyImporter.finalized)).length;
  }

  renderModeComponent = () => {
    const {depositing, spending, viewAddresses} = this.props;
    if (depositing) return <WalletDeposit/>
    else if (spending) return <WalletSpend addNode={this.addNode} updateNode={this.updateNode}/>
    else if (viewAddresses) return <WalletView />
    return "";
  }

  body() {
    const {totalSigners, configuring} = this.props;
    const {generating} = this.state;
    if (this.extendedPublicKeyCount() === totalSigners) {
      if (generating) {
        return (
          <div>
            {<WalletControl/>}
          </div>
        );
      } else {

        // add download details button.

        return (
          <div>
            <Button type="button" variant="contained" color="secondary" onClick={this.toggleImporters}>
              {configuring ? 'Hide Key Selection' : 'Edit Details'}
            </Button>
            <ConfirmWallet/>
            <p>You have imported all {totalSigners} extended public keys.  You will need to save this information.</p>
            <Button variant="contained" color="primary" onClick={this.downloadWalletDetails}>Download Wallet Details</Button>
            <p>Please confirm that the above information is correct and you wish to generate your wallet.</p>
            <Button type="button" variant="contained" color="primary" onClick={this.generate}>Confirm</Button>
          </div>
        );
      }
    }
    return (
      <p>
        {`Once you have imported all ${totalSigners} extended public keys, `}
        {'your wallet will be generated here.'}
      </p>
    );
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
    return `  * ${extendedPublicKeyImporter.name}: ${bip32Path}`;
  }

  walletDetailsFilename = () => {
    const {totalSigners, requiredSigners, addressType, walletName} = this.props;
    return `bitcoin-${requiredSigners}-of-${totalSigners}-${addressType}-${walletName}.txt`;

  }


  toggleImporters = () => {
    const { setImportersVisible, configuring } = this.props;
    setImportersVisible(!configuring);
  }

  generate = () => {
    const {freeze} = this.props;
    freeze(true);
    this.setState({generating: true});
    this.addNode(false, "m/0/0", true);
    this.addNode(true, "m/1/0", true);
  }

  updateNode = (isChange, update) => {
    const {updateChangeNode, updateDepositNode} = this.props;
    const updater = (isChange ? updateChangeNode : updateDepositNode);
    updater(update);
  }

  addNode = (isChange, bip32Path, attemptToKeepGenerating) => {
    this.updateNode(isChange, {bip32Path});
    // If we just call generateMultisig here the calculations proceed
    // so quickly that React never gets a chance to render; the code
    // behaves as though generateMultisig is synchronous/blocking,
    // even though it's not, and the page updates only once ALL the
    // nodes have been calculated.
    //
    // If we instead wrap it with setTimeout with a timeout of 0, we
    // push its evaluation into the next tick, which lets React catch
    // up with rendering.  The nodes appear in the UI in rolling
    // batches.
    setTimeout(() => this.generateMultisig(isChange, bip32Path, attemptToKeepGenerating));
  }

  generateMultisig = (isChange, bip32Path, attemptToKeepGenerating) => {
    const {extendedPublicKeyImporters, totalSigners, network, addressType, requiredSigners} = this.props;
    const publicKeys = [];
    for (let extendedPublicKeyImporterNumber=1; extendedPublicKeyImporterNumber <= totalSigners; extendedPublicKeyImporterNumber++) {
      const extendedPublicKeyImporter = extendedPublicKeyImporters[extendedPublicKeyImporterNumber];
      const publicKey = deriveChildPublicKey(extendedPublicKeyImporter.extendedPublicKey, bip32Path, network);
      publicKeys.push(publicKey);
    }
    publicKeys.sort(); // BIP67

    const multisig = generateMultisigFromPublicKeys(network, addressType, requiredSigners, ...publicKeys);
    this.updateNode(isChange, {bip32Path, multisig});
    // Similar to above, we wrap the call to lookup the node balance
    // with setTimeout with a timeout of zero to allow React time to
    // render.
    setTimeout(() => this.fetchUTXOs(isChange, bip32Path, multisig, attemptToKeepGenerating));
  }

  fetchUTXOs = async (isChange, bip32Path, multisig, attemptToKeepGenerating) => {
    const {network, client} = this.props;
    let utxos, addressStatus;
    try {
      addressStatus = await getAddressStatus(multisig.address, network, client);
      utxos = await fetchAddressUTXOs(multisig.address, network, client);
    } catch(e) {
      console.error(e);
      this.updateNode({bip32Path, fetchUTXOsError: e.toString()});
    }
    if (utxos) {
      const balanceSats = utxos
            .map((utxo) => utxo.amountSats)
            .reduce(
              (accumulator, currentValue) => accumulator.plus(currentValue),
              new BigNumber(0));
      this.updateNode(isChange, {bip32Path, balanceSats, utxos, fetchedUTXOs: true, fetchUTXOsError: ''});
    }
    if (addressStatus) {
      this.updateNode(isChange, {bip32Path, addressUsed: addressStatus.used});
    }

    // Similar to above, we wrap the call to generate the next node
    // with setTimeout with a timeout of zero to allow React time to
    // render.
    if (attemptToKeepGenerating) {
      setTimeout(() => this.generateNextNodeIfNecessary(isChange, bip32Path));
    }
  }

  generateNextNodeIfNecessary = (isChange, bip32Path) => {
    const {change, deposits} = this.props;
    const trailingEmptyNodes = (isChange ? change : deposits).trailingEmptyNodes;
    const fetchUTXOsErrors = (isChange ? change : deposits).fetchUTXOsErrors;
    const allBIP32Paths = Object.keys((isChange ? change : deposits).nodes);
    if ((trailingEmptyNodes >= MAX_TRAILING_EMPTY_NODES) || (fetchUTXOsErrors >= MAX_FETCH_UTXOS_ERRORS)) {
      return;
    }

    allBIP32Paths.sort((p1, p2) => {
      const p1Segments = (p1 || '').split('/');
      const p2Segments = (p2 || '').split('/');
      const p1Index = parseInt(p1Segments[2]);
      const p2Index = parseInt(p2Segments[2]);
      return p1Index - p2Index;
    });
    const pathSegments = (allBIP32Paths[allBIP32Paths.length-1] || '').split('/'); // m, 0, 1
    const maxIndex = parseInt(pathSegments[2]);
    const nextBIP32Path = `m/${pathSegments[1]}/${maxIndex + 1}`;
    // Similar to above, we wrap the call to add the next node with
    // setTimeout with a timeout of zero to allow React time to
    // render.
    setTimeout(() => this.addNode(isChange, nextBIP32Path, true));
  }
}

function mapStateToProps(state) {
  return {
    ...state.settings,
    ...{client: state.client},
    ...state.quorum,
    ...state.wallet,
    ...state.wallet.info,
  };
}

const mapDispatchToProps = {
  freeze: setFrozen,
  updateDepositNode: updateDepositNodeAction,
  updateChangeNode: updateChangeNodeAction,
  updateAutoSpned: updateAutoSpendAction,
  setImportersVisible: setExtendedPublicKeyImporterVisible,
  setIsWallet,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletGenerator);
