import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Components
import { Box, Button } from "@material-ui/core";
import Transaction from "../ScriptExplorer/Transaction";
import ExtendedPublicKeySelector from "./ExtendedPublicKeySelector";

// Actions
import {
  finalizeOutputs as finalizeOutputsAction,
  setRequiredSigners as setRequiredSignersAction,
  resetTransaction as resetTransactionAction,
  setSpendStep as setSpendStepAction,
  SPEND_STEP_CREATE,
} from "../../actions/transactionActions";
import {
  spendSlices as spendSlicesAction,
  resetWalletView as resetWalletViewAction,
  updateChangeSliceAction as updateChangeSliceActionImport,
} from "../../actions/walletActions";
import UnsignedTransaction from "../UnsignedTransaction";

class WalletSign extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spent: false,
    };
  }

  render = () => {
    const { spent } = this.state;
    return (
      <Box>
        <Button href="#" onClick={this.handleCancel}>
          Edit Transaction
        </Button>

        <Box mt={2}>
          <UnsignedTransaction />
        </Box>
        {this.renderKeySelectors()}

        <Box mt={2}>
          <Button
            href="#"
            onClick={(e) => {
              e.preventDefault();
              this.handleReturn();
            }}
          >
            Abandon Transaction
          </Button>
        </Box>

        {this.signaturesFinalized() && (
          <Box mt={2}>
            <Transaction />
          </Box>
        )}

        {(this.transactionFinalized() || spent) && (
          <Button
            variant="contained"
            color="primary"
            onClick={this.handleReturn}
          >
            Return
          </Button>
        )}
      </Box>
    );
  };

  renderKeySelectors = () => {
    const { requiredSigners } = this.props;
    const keySelectors = [];
    for (
      let keySelectorNum = 1;
      keySelectorNum <= requiredSigners;
      keySelectorNum += 1
    ) {
      keySelectors.push(
        <Box key={keySelectorNum} mt={2}>
          <ExtendedPublicKeySelector number={keySelectorNum} />
        </Box>
      );
    }
    return keySelectors;
  };

  signaturesFinalized = () => {
    const { signatureImporters } = this.props;
    return (
      Object.values(signatureImporters).length > 0 &&
      Object.values(signatureImporters).every(
        (signatureImporter) => signatureImporter.finalized
      )
    );
  };

  transactionFinalized = () => {
    const {
      transaction,
      spendSlices,
      changeSlice,
      updateChangeNode,
    } = this.props;

    const { txid } = transaction;
    const { spent } = this.state;
    if (txid !== "" && !spent) {
      this.setState({ spent: true });
      const changeAddress = changeSlice.multisig.address;
      for (let i = 0; i < transaction.outputs.length; i += 1) {
        if (changeAddress === transaction.outputs[i].address) {
          updateChangeNode({
            bip32Path: changeSlice.bip32Path,
            balanceSats: transaction.outputs[i].amountSats,
          });
          break;
        }
      }
      spendSlices(transaction.inputs, changeSlice);
      return true;
    }

    return false;
  };

  handleReturn = () => {
    const { resetTransaction, resetWalletView } = this.props;
    resetTransaction();
    resetWalletView();
  };

  handleCancel = (event) => {
    const {
      finalizeOutputs,
      requiredSigners,
      setRequiredSigners,
      setSpendStep,
    } = this.props;
    event.preventDefault();
    setRequiredSigners(requiredSigners); // this will generate signature importers
    finalizeOutputs(false);
    setSpendStep(SPEND_STEP_CREATE);
  };
}

WalletSign.propTypes = {
  changeSlice: PropTypes.shape({
    bip32Path: PropTypes.string,
    multisig: PropTypes.shape({
      address: PropTypes.string,
    }),
  }).isRequired,
  finalizeOutputs: PropTypes.func.isRequired,
  requiredSigners: PropTypes.number.isRequired,
  resetTransaction: PropTypes.func.isRequired,
  resetWalletView: PropTypes.func.isRequired,
  setRequiredSigners: PropTypes.func.isRequired,
  setSpendStep: PropTypes.func.isRequired,
  signatureImporters: PropTypes.shape({}).isRequired,
  spendSlices: PropTypes.func.isRequired,
  transaction: PropTypes.shape({
    inputs: PropTypes.arrayOf(
      PropTypes.shape({
        change: PropTypes.bool.isRequired,
        multisig: PropTypes.shape({
          address: PropTypes.string,
        }),
      })
    ),
    outputs: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string,
        amountSats: PropTypes.shape({}),
      })
    ),
    txid: PropTypes.string,
  }).isRequired,
  updateChangeNode: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    ...state.wallet,
    ...state.spend,
    ...state.quorum,
    requiredSigners: state.spend.transaction.requiredSigners,
    totalSigners: state.spend.transaction.totalSigners,
    changeSlice: state.wallet.change.nextNode,
  };
}

const mapDispatchToProps = {
  finalizeOutputs: finalizeOutputsAction,
  setRequiredSigners: setRequiredSignersAction,
  spendSlices: spendSlicesAction,
  resetTransaction: resetTransactionAction,
  resetWalletView: resetWalletViewAction,
  updateChangeNode: updateChangeSliceActionImport,
  setSpendStep: setSpendStepAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletSign);
