import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Components
import QRCode from "qrcode.react";
import Copyable from "../Copyable";
import {
  Card, CardHeader,
  CardContent
} from '@material-ui/core';

class WalletDeposit extends React.Component {
  state = {
    address: ""
  }
  componentDidMount() {
    const { deposits } = this.props;
    const nodes = Object.values(deposits.nodes)
    for(let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (node.balanceSats.isEqualTo(0)) {
        this.setState({address: node.multisig.address});
        break;
      }
    }
    if (this.state.address === "") {
      // TODO: get more
    }
  }

  render() {
    const { address } = this.state;
    return (
      <Card>
        <CardHeader title="Deposit"/>
        <CardContent>
          <Copyable text={address} newline={true}>
            <QRCode size={300} value={address} level={'L'} />
            <p>Scan QR code or click to copy address to clipboard.</p>
          </Copyable>
        </CardContent>
      </Card>
    )
  }
}

function mapStateToProps(state) {
  return { ...state.wallet, };
}

const mapDispatchToProps = {

};

export default connect(mapStateToProps, mapDispatchToProps)(WalletDeposit);
