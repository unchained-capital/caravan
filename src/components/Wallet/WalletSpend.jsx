import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Components
import NodeSet from "./NodeSet";
import {
    Button, Card, CardHeader,
    CardContent
  } from '@material-ui/core';

class WalletSpend extends React.Component {

  static propTypes = {
    addNode: PropTypes.func.isRequired,
    updateNode: PropTypes.func.isRequired,
  };

  render() {
    return (
        <Card>
          <CardHeader title="Spend"/>
          <CardContent>
            <NodeSet addNode={this.addNode} updateNode={this.updateNode} />
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

export default connect(mapStateToProps, mapDispatchToProps)(WalletSpend);
