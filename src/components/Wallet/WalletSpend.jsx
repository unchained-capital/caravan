import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import BigNumber from "bignumber.js";

// Actions
import {
  Box,
  Grid,
  Switch,
  FormControlLabel,
  Typography,
  Button,
} from "@material-ui/core";
import { bitcoinsToSatoshis } from "unchained-bitcoin";
import {
  updateDepositSliceAction,
  updateChangeSliceAction,
  resetNodesSpend as resetNodesSpendAction,
} from "../../actions/walletActions";
import {
  setInputs as setInputsAction,
  setFeeRate as setFeeRateAction,
  addOutput,
  setOutputAddress,
  updateAutoSpendAction,
  setChangeAddressAction,
  finalizeOutputs as finalizeOutputsAction,
  SPEND_STEP_CREATE,
  SPEND_STEP_PREVIEW,
  SPEND_STEP_SIGN,
  setSpendStep as setSpendStepAction,
} from "../../actions/transactionActions";

// Components
import NodeSet from "./NodeSet";
import OutputsForm from "../ScriptExplorer/OutputsForm";
import WalletSign from "./WalletSign";
import TransactionPreview from "./TransactionPreview";

class WalletSpend extends React.Component {
  outputsAmount = new BigNumber(0);

  feeAmount = new BigNumber(0);

  static propTypes = {
    addNode: PropTypes.func.isRequired,
    autoSpend: PropTypes.bool,
    balanceError: PropTypes.string,
    changeNode: PropTypes.shape({
      multisig: PropTypes.shape({
        address: PropTypes.string,
      }),
    }).isRequired,
    changeNodes: PropTypes.shape({}),
    changeOutputIndex: PropTypes.number.isRequired,
    coinSelection: PropTypes.func.isRequired,
    depositNodes: PropTypes.shape({}),
    fee: PropTypes.number.isRequired,
    feeError: PropTypes.string,
    feeRate: PropTypes.string.isRequired,
    feeRateError: PropTypes.string,
    finalizeOutputs: PropTypes.func.isRequired,
    finalizedOutputs: PropTypes.bool,
    inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    outputs: PropTypes.arrayOf(
      PropTypes.shape({
        address: PropTypes.string,
        amount: PropTypes.number,
        addressError: PropTypes.string,
        amountError: PropTypes.string,
      })
    ).isRequired,
    resetNodesSpend: PropTypes.func.isRequired,
    setChangeAddress: PropTypes.func.isRequired,
    setInputs: PropTypes.func.isRequired,
    setFeeRate: PropTypes.func.isRequired,
    setSpendStep: PropTypes.func.isRequired,
    spendingStep: PropTypes.number,
    updateAutoSpend: PropTypes.func.isRequired,
    updateChangeSlice: PropTypes.func.isRequired,
    updateDepositSlice: PropTypes.func.isRequired,
    updateNode: PropTypes.func.isRequired,
  };

  static defaultProps = {
    autoSpend: false,
    balanceError: null,
    changeNodes: {},
    depositNodes: {},
    finalizedOutputs: false,
    feeError: null,
    feeRateError: null,
    spendingStep: 0,
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.autoSpend) {
      setTimeout(this.selectCoins, 0);
    }
  }

  componentDidMount = () => {
    const {
      changeNode,
      setChangeAddress,
      finalizeOutputs,
      finalizedOutputs,
      autoSpend,
    } = this.props;
    if (autoSpend) setChangeAddress(changeNode.multisig.address);
    if (finalizedOutputs) finalizeOutputs(false);
  };

  previewDisabled = () => {
    const {
      finalizedOutputs,
      outputs,
      inputs,
      feeRateError,
      feeError,
      balanceError,
    } = this.props;
    if (inputs.length === 0) return true;
    if (finalizedOutputs || feeRateError || feeError || balanceError) {
      return true;
    }
    for (let i = 0; i < outputs.length; i += 1) {
      const output = outputs[i];
      if (
        output.address === "" ||
        output.amount === "" ||
        output.addressError !== "" ||
        output.amountError !== ""
      ) {
        return true;
      }
    }
    return false;
  };

  signTransaction = () => {
    const { setSpendStep } = this.props;
    setSpendStep(SPEND_STEP_SIGN);
  };

  showPreview = () => {
    const { finalizeOutputs, setSpendStep } = this.props;

    setSpendStep(SPEND_STEP_PREVIEW);
    finalizeOutputs(true);
  };

  showCreate = () => {
    const { finalizeOutputs, setSpendStep } = this.props;

    setSpendStep(SPEND_STEP_CREATE);
    finalizeOutputs(false);
  };

  renderSpend = () => {
    const { autoSpend } = this.props;
    return (
      <Box>
        <FormControlLabel
          control={
            <Switch checked={!autoSpend} onChange={this.handleSpendMode} />
          }
          label="Manual"
        />
      </Box>
    );
  };

  handleSpendMode = (event) => {
    const { updateAutoSpend } = this.props;
    if (event.target.checked) {
      // select inputs for transaction
      // select change address???,
      // how to identify???
      // calculate change???
    }

    updateAutoSpend(!event.target.checked);
  };

  selectCoins = () => {
    const {
      outputs,
      setInputs,
      fee,
      depositNodes,
      changeNodes,
      feeRate,
      changeOutputIndex,
      autoSpend,
      updateChangeSlice,
      updateDepositSlice,
      resetNodesSpend,
      setFeeRate,
      coinSelection,
    } = this.props;
    const outputsAmount = outputs.reduce((sum, output, outputIndex) => {
      return changeOutputIndex === outputIndex + 1
        ? sum
        : sum.plus(output.amountSats);
    }, new BigNumber(0));
    if (outputsAmount.isNaN()) return;
    const feeAmount = bitcoinsToSatoshis(new BigNumber(fee));
    if (
      outputsAmount.isEqualTo(this.outputsAmount) &&
      feeAmount.isEqualTo(this.feeAmount)
    )
      return;
    const outputTotal = outputsAmount.plus(feeAmount);
    const spendableInputs = Object.values(depositNodes)
      .concat(Object.values(changeNodes))
      .filter((node) => node.balanceSats.isGreaterThan(0));

    resetNodesSpend();
    const selectedInputs = coinSelection(spendableInputs, outputTotal);

    selectedInputs.forEach((selectedUtxo) => {
      (selectedUtxo.change ? updateChangeSlice : updateDepositSlice)({
        bip32Path: selectedUtxo.bip32Path,
        spend: true,
      });
    });

    this.outputsAmount = outputsAmount;
    this.feeAmount = feeAmount;
    setInputs(selectedInputs);
    if (changeOutputIndex > 0 || !autoSpend) setFeeRate(feeRate); // recalulate fee
  };

  render() {
    const { autoSpend, updateNode, addNode, spendingStep } = this.props;

    return (
      <Box style={{ marginLeft: "10%" }}>
        <Grid container>
          {spendingStep === SPEND_STEP_SIGN && (
            <Grid item md={12}>
              <Box>
                <WalletSign />
              </Box>
            </Grid>
          )}
          {spendingStep === SPEND_STEP_CREATE && (
            <Grid item md={12}>
              <Box mt={2}>
                <Box mb={7}>
                  <div style={{ width: "100%" }}>
                    <Box display="flex" p={1}>
                      <Box p={1} flexGrow={1}>
                        <Typography align="center" variant="h4">
                          Create Transaction
                        </Typography>
                      </Box>
                      <Box p={1}>{this.renderSpend()}</Box>
                    </Box>
                  </div>
                  <Box component="div" display={autoSpend ? "none" : "block"}>
                    <NodeSet addNode={addNode} updateNode={updateNode} />
                  </Box>
                  <OutputsForm />
                  <div style={{ width: "100%" }}>
                    <Box display="flex" p={1}>
                      <Box p={1} flexGrow={1} mt={8}>
                        <Typography align="center" variant="h4">
                          <Button
                            onClick={this.showPreview}
                            variant="contained"
                            color="primary"
                            disabled={this.previewDisabled()}
                          >
                            Preview Transaction
                          </Button>
                        </Typography>
                      </Box>
                    </Box>
                  </div>
                </Box>
              </Box>
            </Grid>
          )}
          {spendingStep === SPEND_STEP_PREVIEW && (
            <Grid item md={12}>
              <Box mt={3}>
                <TransactionPreview
                  editTransaction={this.showCreate}
                  signTransaction={this.signTransaction}
                />
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
    );
  }
}

function mapStateToProps(state) {
  return {
    ...state.spend.transaction,
    changeNodes: state.wallet.change.nodes,
    changeNode: state.wallet.change.nextNode,
    depositNodes: state.wallet.deposits.nodes,
    autoSpend: state.spend.transaction.autoSpend,
  };
}

const mapDispatchToProps = {
  updateAutoSpend: updateAutoSpendAction,
  setInputs: setInputsAction,
  updateChangeSlice: updateChangeSliceAction,
  updateDepositSlice: updateDepositSliceAction,
  setAddress: setOutputAddress,
  resetNodesSpend: resetNodesSpendAction,
  setFeeRate: setFeeRateAction,
  addOutput,
  finalizeOutputs: finalizeOutputsAction,
  setChangeAddress: setChangeAddressAction,
  setSpendStep: setSpendStepAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletSpend);
