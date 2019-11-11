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
  Form,
  FormText,
} from "react-bootstrap";
import Copyable from "../Copyable";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

class Node extends React.Component {

  static propTypes = {
    network: PropTypes.string.isRequired,
    addressType: PropTypes.string.isRequired,
    addNode: PropTypes.func.isRequired,
    present: PropTypes.bool,
    bip32Path: PropTypes.string.isRequired,
    multisig: PropTypes.object,
    spend: PropTypes.bool.isRequired,
    balanceSats: PropTypes.object.isRequired,
    fetchedUTXOs: PropTypes.bool.isRequired,
    fetchUTXOsError: PropTypes.string.isRequired,
    change: PropTypes.bool.isRequired,
  };

  componentDidMount = () => {
    this.generate();
  }

  render = () => {
    const {network, bip32Path, spend, fetchedUTXOs, balanceSats, fetchUTXOsError, multisig} = this.props;
    return (
      <tr key={bip32Path}>
        <td>
          <Form.Check
            id={bip32Path}
            type="checkbox"
            name="spend"
            onChange={this.handleSpend}
            checked={spend}
            disabled={!fetchedUTXOs || balanceSats.isEqualTo(0)}
          />
        </td>
        <td>
          <code>{bip32Path}</code>
        </td>
        <td>
          {fetchedUTXOs ? satoshisToBitcoins(balanceSats).toFixed() : ''}
          {fetchUTXOsError !== '' && <FormText className="danger">{fetchUTXOsError}</FormText>}
        </td>
        <td>
          {multisig ? 
           <span>
             <Copyable text={multisig.address}><code>{multisig.address}</code></Copyable>
             &nbsp;
             {externalLink(blockExplorerAddressURL(multisig.address, network), <FontAwesomeIcon icon={faExternalLinkAlt} />)}
           </span>
           : '...'}
        </td>
      </tr>
      );
  }

  generate = () => {
    const {present, change, bip32Path, addNode} = this.props;
    if (!present) {
      addNode(change, bip32Path);
    }
  }

  handleSpend = () => {
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
