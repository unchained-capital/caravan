import React from 'react';
import { connect } from 'react-redux';

// Actions
import { updateDepositingAction, updateSpendingAction } from "../../actions/walletActions";

// Components
import NodeSet from "./NodeSet";

function nullFun(){}

class WalletView extends React.Component {

  render = () => {
    return (
        <NodeSet addNode={nullFun} updateNode={nullFun} />
    )
  }

}

function mapStateToProps(state) {
  return { ...state.wallet, };
}

const mapDispatchToProps = {
  setDepositing: updateDepositingAction,
  setSpending: updateSpendingAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletView);
