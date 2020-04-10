import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

// Components
import Transaction from '../ScriptExplorer/Transaction';
import ExtendedPublicKeySelector from './ExtendedPublicKeySelector'
import {Box, Button, Link} from "@material-ui/core";

// Actions
import { finalizeOutputs, setRequiredSigners, 
  resetTransaction, setSpendStep, SPEND_STEP_CREATE} from '../../actions/transactionActions';
import { spendNodes, resetWalletView,   updateChangeSliceAction } from "../../actions/walletActions";
import UnsignedTransaction from '../UnsignedTransaction';

class WalletSign extends React.Component {
  static propTypes = {
    transaction: PropTypes.object.isRequired,
    signatureImporters: PropTypes.shape({}).isRequired,
    changeNode: PropTypes.shape({}).isRequired,
    finalizeOutputs: PropTypes.func.isRequired,
    setRequiredSigners: PropTypes.func.isRequired,
    spendNodes: PropTypes.func.isRequired,
    resetTransaction: PropTypes.func.isRequired,
  };

  state = {
    spent: false,
  }

  render = () => {
    return (
      <Box>

        <Link
          href="#"
          onClick={this.handleCancel}>Edit Transaction</Link>

      <Box mt={2}>
        <UnsignedTransaction/>
      </Box>
      {this.renderKeySelectors()}

        <Box mt={2}>
          <Link
            href="#"
            onClick={e => {e.preventDefault(); this.handleReturn();}}>Abandon Transaction</Link>
        </Box>

      {
        this.signaturesFinalized() &&
        <Box mt={2}>
          <Transaction/>
        </Box>
      }

      {
        (this.transactionFinalized() || this.state.spent) &&
        <Button
          variant="contained"
          color="primary"
          onClick={this.handleReturn}>Return</Button>
      }
  </Box>

    )
  }

  renderKeySelectors = () => {
    const {requiredSigners} = this.props;
    const keySelectors = [];
    for (var keySelectorNum = 1; keySelectorNum <= requiredSigners; keySelectorNum++) {
      keySelectors.push(
        <Box key={keySelectorNum} mt={2}>
          <ExtendedPublicKeySelector number={keySelectorNum} />
        </Box>
      );
    }
    return keySelectors;
  }

  signaturesFinalized = () => {
    const {signatureImporters} = this.props;
    return Object.values(signatureImporters).length > 0 && Object.values(signatureImporters).every((signatureImporter) => signatureImporter.finalized);
  }

  transactionFinalized = () => {
    const { transaction, spendNodes, changeNode, updateChangeNode } = this.props;

    const txid = transaction.txid;
    if (txid !== "" && !this.state.spent) {
      this.setState({spent: true})
      const changeAddress = changeNode.multisig.address;
      for (let i = 0; i < transaction.outputs.length; i++) {
        if (changeAddress === transaction.outputs[i].address) {
          updateChangeNode({bip32Path: changeNode.bip32Path, balanceSats: transaction.outputs[i].amountSats})
          break;
        }
      }
      spendNodes();
      return true;
    }

    return false;
  }

  handleReturn = () => {
    const { resetTransaction, resetWalletView } = this.props;
    resetTransaction();
    resetWalletView();
  }

  handleCancel = (event) => {
    const { finalizeOutputs, requiredSigners, setRequiredSigners, setSpendStep } = this.props;
    event.preventDefault();
    setRequiredSigners(requiredSigners); // this will generate signature importers
    finalizeOutputs(false);
    setSpendStep(SPEND_STEP_CREATE)

  }
}


function mapStateToProps(state) {
  return {
    ...state.wallet,
    ...state.spend,
    ...state.quorum,
    requiredSigners: state.spend.transaction.requiredSigners,
    totalSigners: state.spend.transaction.totalSigners,
    changeNode: state.wallet.change.nextNode
  };
}

const mapDispatchToProps = {
  finalizeOutputs,
  setRequiredSigners,
  spendNodes,
  resetTransaction,
  resetWalletView,
  updateChangeNode: updateChangeSliceAction,
  setSpendStep,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletSign);