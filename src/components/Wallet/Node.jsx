import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  satoshisToBitcoins,
  blockExplorerAddressURL,
} from 'unchained-bitcoin';
import {
  externalLink,
} from "../../utils";

// Components
import {
  TableRow, TableCell, Checkbox, FormHelperText, Grid,
  ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary
} from '@material-ui/core';
import Copyable from "../Copyable";
import UTXOSet from "../Spend/UTXOSet";
import LaunchIcon from '@material-ui/icons/Launch';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MultisigDetails from "../MultisigDetails";

// Actions
import {
  setInputs, setFeeRate,
} from '../../actions/transactionActions';
import { updateAutoSpendAction, WALLET_MODES } from "../../actions/walletActions";

import styles from '../Spend//styles.module.scss';

class Node extends React.Component {

  static propTypes = {
    network: PropTypes.string.isRequired,
    addressType: PropTypes.string.isRequired,
    addNode: PropTypes.func.isRequired,
    updateNode: PropTypes.func.isRequired,
    present: PropTypes.bool,
    bip32Path: PropTypes.string.isRequired,
    multisig: PropTypes.object,
    spend: PropTypes.bool.isRequired,
    change: PropTypes.bool.isRequired,
    setInputs: PropTypes.func.isRequired,
    setFeeRate: PropTypes.func.isRequired,
  };

  componentDidMount = () => {
    this.generate();
  }

  render = () => {
    const {bip32Path, spend, fetchedUTXOs, balanceSats, fetchUTXOsError,
      multisig, utxos, walletMode, addressKnown} = this.props;
    const spending = walletMode === WALLET_MODES.SPEND;
    return (
      <TableRow key={bip32Path}>
        { spending &&
          <TableCell>
            <Checkbox
              id={bip32Path}
              name="spend"
              onChange={this.handleSpend}
              checked={spend}
              disabled={!fetchedUTXOs || balanceSats.isEqualTo(0)}
            />
          </TableCell>
        }
        <TableCell>
          <code>{bip32Path}</code>
        </TableCell>
        <TableCell>
          {utxos.length}
        </TableCell>
        <TableCell>
          {fetchedUTXOs && addressKnown ? satoshisToBitcoins(balanceSats).toFixed() : ''}
          {fetchUTXOsError !== '' && <FormHelperText className="danger">{fetchUTXOsError}</FormHelperText>}
        </TableCell>
        <TableCell>
          {multisig ? this.renderAddress()
           : '...'}
        </TableCell>
      </TableRow>
      );
  }

  addressContent = () => {
    const {multisig, network, addressUsed, balanceSats} = this.props;
    return (
      <div>
        <Copyable text={multisig.address}>
          <code className={addressUsed && balanceSats.isEqualTo(0) ? styles.spent : ""}>{multisig.address}</code>
          </Copyable>
        &nbsp;
        {externalLink(blockExplorerAddressURL(multisig.address, network), <LaunchIcon onClick={e => e.stopPropagation()} />)}
      </div>
    )
  }

  renderAddress = () => {
    const {bip32Path, utxos,  balanceSats, multisig} = this.props;
    return (
      <ExpansionPanel>
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id={'address-header'+bip32Path}
      >
        {this.addressContent()}
     </ExpansionPanelSummary>
     <ExpansionPanelDetails>
       <Grid container>
        <Grid item md={12}>
          <MultisigDetails multisig={multisig} />
        </Grid>
        { balanceSats.isGreaterThan(0) &&
        <Grid item md={12}>
          <UTXOSet
            inputs={utxos}
            inputsTotalSats={balanceSats}
          />
        </Grid>
        }
       </Grid>
     </ExpansionPanelDetails>

   </ExpansionPanel>  )

  }

  generate = () => {
    const {present, change, bip32Path, addNode} = this.props;
    if (!present) {
      addNode(change, bip32Path);
    }
  }

  handleSpend = (e) => {
    const {change, bip32Path, updateNode, inputs, utxos, multisig, setInputs,
      updateAutoSpend, setFeeRate, feeRate} = this.props;
    let newInputs;
    if (e.target.checked) {
      newInputs = inputs.concat(utxos.map(utxo => ({...utxo, multisig, bip32Path: bip32Path})))
    } else {
      newInputs = inputs.filter(input => {
        const newUtxos = utxos.filter(utxo => {
          return utxo.txid === input.txid && utxo.index === input.index;
        })
        return newUtxos.length === 0;
      })
    }
    setInputs(newInputs);
    updateNode(change, {spend: e.target.checked, bip32Path});
    updateAutoSpend(false);
    setFeeRate(feeRate);
  }

}

function mapStateToProps(state, ownProps) {
  const change = ((ownProps.bip32Path || '').split('/')[1] === '1'); // // m, 0, 1
  const braid = state.wallet[change ? 'change' : 'deposits'];
  return {
    ...state.settings,
    ...{change},
    ...braid.nodes[ownProps.bip32Path],
    ...state.spend.transaction,
    walletMode: state.wallet.info.walletMode,

  };
}

const mapDispatchToProps = {
  setInputs,
  setFeeRate,
  updateAutoSpend: updateAutoSpendAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Node);
