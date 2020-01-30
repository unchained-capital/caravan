import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  satoshisToBitcoins,
} from 'unchained-bitcoin';

// Components
import {
  TableRow, TableCell, Checkbox, FormHelperText,
} from '@material-ui/core';
import AddressExpander from "./AddressExpander";

// Actions
import {
  setInputs, setFeeRate, updateAutoSpendAction,
} from '../../actions/transactionActions';
import { WALLET_MODES } from "../../actions/walletActions";


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
          {this.minUtxoDate()}
        </TableCell>

        <TableCell>
          {multisig ? this.renderAddress()
           : '...'}
        </TableCell>
      </TableRow>
      );
  }

  minUtxoDate = () => {
    const {utxos} = this.props;
    if (!utxos.length) return ""
    const mintime = Math.min(...utxos.map(utxo => utxo.time))
    if (isNaN(mintime)) return "Pending"
    return (new Date(1000 * mintime).toLocaleDateString())
  }

  renderAddress = () => {
    return <AddressExpander node={this.props.braidNode} />
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
    braidNode: braid.nodes[ownProps.bip32Path],

  };
}

const mapDispatchToProps = {
  setInputs,
  setFeeRate,
  updateAutoSpend: updateAutoSpendAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(Node);
