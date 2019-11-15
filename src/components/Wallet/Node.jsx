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
  TableRow, TableCell, Checkbox, FormHelperText
} from '@material-ui/core';
import Copyable from "../Copyable";
import LaunchIcon from '@material-ui/icons/Launch';

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
    // balanceSats: PropTypes.object.isRequired,
    // fetchedUTXOs: PropTypes.bool.isRequired,
    // fetchUTXOsError: PropTypes.string.isRequired,
    change: PropTypes.bool.isRequired,
  };

  componentDidMount = () => {
    this.generate();
  }

  render = () => {
    const {network, bip32Path, spend, fetchedUTXOs, balanceSats, fetchUTXOsError, multisig} = this.props;
    return (
      <TableRow key={bip32Path}>
        <TableCell>
          <Checkbox
            id={bip32Path}
            name="spend"
            onChange={this.handleSpend}
            checked={spend}
            disabled={!fetchedUTXOs || balanceSats.isEqualTo(0)}
          />
        </TableCell>
        <TableCell>
          <code>{bip32Path}</code>
        </TableCell>
        <TableCell>
          {fetchedUTXOs ? satoshisToBitcoins(balanceSats).toFixed() : ''}
          {fetchUTXOsError !== '' && <FormHelperText className="danger">{fetchUTXOsError}</FormHelperText>}
        </TableCell>
        <TableCell>
          {multisig ?
           <span>
             <Copyable text={multisig.address}><code>{multisig.address}</code></Copyable>
             &nbsp;
             {externalLink(blockExplorerAddressURL(multisig.address, network), <LaunchIcon />)}
           </span>
           : '...'}
        </TableCell>
      </TableRow>
      );
  }

  generate = () => {
    const {present, change, bip32Path, addNode} = this.props;
    if (!present) {
      addNode(change, bip32Path);
    }
  }

  handleSpend = (e) => {
    const {change, bip32Path, updateNode} = this.props;
    updateNode(change, {spend: e.target.checked, bip32Path})
  }

}

function mapStateToProps(state, ownProps) {
  const change = ((ownProps.bip32Path || '').split('/')[1] === '1'); // // m, 0, 1
  const braid = state.wallet[change ? 'change' : 'deposits'];
  return {
    ...state.settings,
    ...{change},
    ...braid.nodes[ownProps.bip32Path],
  };
}

const mapDispatchToProps = {
};

export default connect(mapStateToProps, mapDispatchToProps)(Node);
