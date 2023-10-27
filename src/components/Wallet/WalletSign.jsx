import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Components
import { Box, Button } from "@mui/material";
import Transaction from "../ScriptExplorer/Transaction";
import ExtendedPublicKeySelector from "./ExtendedPublicKeySelector";

// Actions
import {
  finalizeOutputs as finalizeOutputsAction,
  setRequiredSigners as setRequiredSignersAction,
  resetTransaction as resetTransactionAction,
  setSpendStep as setSpendStepAction,
  resetPSBT as resetPSBTAction,
  SPEND_STEP_CREATE,
} from "../../actions/transactionActions";
import {
  updateTxSlices as updateTxSlicesAction,
  resetWalletView as resetWalletViewAction,
} from "../../actions/walletActions";
import UnsignedTransaction from "../UnsignedTransaction";

class WalletSign extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      spent: false,
    };
  }

  static getDerivedStateFromProps(props, state) {
    const { txid, changeSlice, updateTxSlices } = props;
    if (txid.length && !state.spent) {
      updateTxSlices(changeSlice);
      return {
        spent: true,
      };
    }
    return null;
  }

  componentWillUnmount() {
    const { resetTransaction } = this.props;
    const { spent } = this.state;

    // reset the transaction when we leave the view if tx is spent
    if (spent) {
      resetTransaction();
    }
  }

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

  handleReturn = () => {
    const { resetTransaction, resetWalletView, resetPSBT } = this.props;
    resetTransaction();
    resetWalletView();
    resetPSBT();
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

        {spent && (
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={this.handleReturn}
            >
              Return
            </Button>
          </Box>
        )}
      </Box>
    );
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
  resetPSBT: PropTypes.func.isRequired,
  setRequiredSigners: PropTypes.func.isRequired,
  setSpendStep: PropTypes.func.isRequired,
  signatureImporters: PropTypes.shape({}).isRequired,
  updateTxSlices: PropTypes.func.isRequired,
  txid: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    ...state.wallet,
    ...state.spend,
    ...state.quorum,
    txid: state.spend.transaction.txid,
    requiredSigners: state.spend.transaction.requiredSigners,
    totalSigners: state.spend.transaction.totalSigners,
    changeSlice: state.wallet.change.nextNode,
  };
}

const mapDispatchToProps = {
  finalizeOutputs: finalizeOutputsAction,
  setRequiredSigners: setRequiredSignersAction,
  updateTxSlices: updateTxSlicesAction,
  resetTransaction: resetTransactionAction,
  resetWalletView: resetWalletViewAction,
  resetPSBT: resetPSBTAction,
  setSpendStep: setSpendStepAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletSign);
