import React from 'react';
import { connect } from 'react-redux';

// Components
import NodeSet from "./NodeSet";

class WalletView extends React.Component {

  render = () => {
    const { addNode, updateNode } = this.props;

    return (
        <NodeSet addNode={addNode} updateNode={updateNode} canLoad={true} />
    )
  }

}

function mapStateToProps(state) {
  return { ...state.wallet, };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(WalletView);
