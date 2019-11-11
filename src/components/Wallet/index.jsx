import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import {connect} from "react-redux";
import {externalLink} from "../../utils";

// Components
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
    return (
      <div>
        <h1>Create Wallet</h1>

        <Row>
          <Col md={8}>
            <WalletGenerator />

            {this.renderExtendedPublicKeyImporters()}

          </Col>
          <Col md={4}>
            <QuorumPicker />
            <AddressTypePicker />
            <NetworkPicker />
            <ClientPicker />
          </Col>
        </Row>
      </div>
    );
  }

  renderExtendedPublicKeyImporters = () => {
    const {totalSigners} = this.props;
    const extendedPublicKeyImporters = [];
    for (let extendedPublicKeyImporterNum = 1; extendedPublicKeyImporterNum  <= totalSigners; extendedPublicKeyImporterNum++) {
      extendedPublicKeyImporters.push(<ExtendedPublicKeyImporter key={extendedPublicKeyImporterNum} number={extendedPublicKeyImporterNum} />);
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
