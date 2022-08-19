import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import BigNumber from "bignumber.js";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Switch,
  FormControlLabel,
  FormHelperText,
  Button,
} from "@material-ui/core";
import {
  updateDepositSliceAction,
  updateChangeSliceAction,
  resetNodesSpend as resetNodesSpendAction,
  autoSelectCoins as autoSelectCoinsAction,
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
  deleteChangeOutput as deleteChangeOutputAction,
  importPSBT,
} from "../../actions/transactionActions";
import { naiveCoinSelection } from "../../utils";
import NodeSet from "./NodeSet";
import OutputsForm from "../ScriptExplorer/OutputsForm";
import WalletSign from "./WalletSign";
import TransactionPreview from "./TransactionPreview";
import { bigNumberPropTypes } from "../../proptypes/utils";

class WalletSpend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      importPSBTDisabled: false,
      importPSBTError: "",
    };
  }

  outputsAmount = new BigNumber(0);

  coinSelection = naiveCoinSelection;

  feeAmount = new BigNumber(0);

  componentDidUpdate = (prevProps) => {
    const { finalizedOutputs } = this.props;
    if (finalizedOutputs && !prevProps.finalizedOutputs) {
      this.showPreview();
    }
  };

  previewDisabled = () => {
    const {
      finalizedOutputs,
      outputs,
      feeRateError,
      feeError,
      inputs,
      balanceError,
      autoSpend,
    } = this.props;

    if (inputs.length === 0 && !autoSpend) return true;
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

  showSignTransaction = () => {
    const { setSpendStep } = this.props;
    setSpendStep(SPEND_STEP_SIGN);
  };

  handleShowPreview = () => {
    const { autoSelectCoins, autoSpend, finalizeOutputs } = this.props;
    if (autoSpend) autoSelectCoins();
    else finalizeOutputs(true);
  };

  showPreview = () => {
    const { setSpendStep } = this.props;
    setSpendStep(SPEND_STEP_PREVIEW);
  };

  showCreate = () => {
    const {
      finalizeOutputs,
      setSpendStep,
      resetNodesSpend,
      deleteChangeOutput,
    } = this.props;
    setSpendStep(SPEND_STEP_CREATE);
    finalizeOutputs(false);

    // for auto spend view, user doesn't have direct knowledge of
    // input nodes and change. So when going back to edit a transaction
    // we want to clear these from the state, since these are added automatically
    // when going from output form to transaction preview

    // for manual spend view, we don't store which utxo is selected right now
    // So when going back to edit a transaction we want to clear everything
    // from the state so that there are no surprises
    resetNodesSpend();
    deleteChangeOutput();
  };

  handleSpendMode = (event) => {
    const { updateAutoSpend, resetNodesSpend, deleteChangeOutput } = this.props;
    updateAutoSpend(!event.target.checked);
    resetNodesSpend();
    deleteChangeOutput();
  };

  handleImportPSBT = ({ target }) => {
    const { importPSBT } = this.props;

    this.setState({ importPSBTDisabled: true, importPSBTError: "" });

    try {
      if (target.files.length === 0) {
        throw new Error("No PSBT provided.");
      }
      if (target.files.length > 1) {
        throw new Error("Multiple PSBTs provided.");
      }

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        try {
          const psbtText = event.target.result;
          importPSBT(psbtText);
          this.setState({ importPSBTDisabled: false, importPSBTError: "" });
        } catch (e) {
          console.error(e);
          this.setState({
            importPSBTDisabled: false,
            importPSBTError: e.message,
          });
        }
      };
      fileReader.readAsText(target.files[0]);
    } catch (e) {
      console.error(e);
      this.setState({ importPSBTDisabled: false, importPSBTError: e.message });
    }
  };

  render() {
    const {
      autoSpend,
      changeAddress,
      changeNode,
      updateNode,
      addNode,
      spendingStep,
      fee,
      feeRate,
      inputs,
      inputsTotalSats,
      outputs,
    } = this.props;
    const { importPSBTDisabled, importPSBTError } = this.state;

    return (
      <Card>
        <CardContent>
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
                <Grid container direction="row-reverse">
                  <Box display="flex-end">
                    <Box p={1}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={!autoSpend}
                            onChange={this.handleSpendMode}
                          />
                        }
                        label="Manual"
                      />
                    </Box>
                  </Box>
                </Grid>
                <Box component="div" display={autoSpend ? "none" : "block"}>
                  <NodeSet addNode={addNode} updateNode={updateNode} />
                </Box>
                <OutputsForm />
                <Box mt={2}>
                  <Button
                    onClick={this.handleShowPreview}
                    variant="contained"
                    color="primary"
                    disabled={this.previewDisabled()}
                  >
                    Preview Transaction
                  </Button>
                </Box>
                <Box mt={2}>
                  <label htmlFor="import-psbt">
                    <input
                      style={{ display: "none" }}
                      id="import-psbt"
                      name="import-psbt"
                      accept="application/base64"
                      onChange={this.handleImportPSBT}
                      type="file"
                    />

                    <Button
                      color="primary"
                      variant="contained"
                      component="span"
                      disabled={importPSBTDisabled}
                      style={{ marginTop: "20px" }}
                    >
                      Import PSBT
                    </Button>
                    <FormHelperText error>{importPSBTError}</FormHelperText>
                  </label>
                </Box>
              </Grid>
            )}
            {spendingStep === SPEND_STEP_PREVIEW && (
              <Grid item md={12}>
                <Box mt={3}>
                  <TransactionPreview
                    changeAddress={changeAddress}
                    changeNode={changeNode}
                    editTransaction={this.showCreate}
                    fee={fee}
                    feeRate={feeRate}
                    inputs={inputs}
                    inputsTotalSats={inputsTotalSats}
                    outputs={outputs}
                    handleSignTransaction={() => this.showSignTransaction()}
                  />
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  }
}

WalletSpend.propTypes = {
  addNode: PropTypes.func.isRequired,
  autoSpend: PropTypes.bool,
  autoSelectCoins: PropTypes.func.isRequired,
  balanceError: PropTypes.string,
  changeNode: PropTypes.shape({
    multisig: PropTypes.shape({
      address: PropTypes.string,
    }),
  }).isRequired,
  changeNodes: PropTypes.shape({}),
  changeAddress: PropTypes.string.isRequired,
  deleteChangeOutput: PropTypes.func.isRequired,
  depositNodes: PropTypes.shape({}),
  fee: PropTypes.string.isRequired,
  feeError: PropTypes.string,
  feeRate: PropTypes.string.isRequired,
  feeRateError: PropTypes.string,
  finalizeOutputs: PropTypes.func.isRequired,
  finalizedOutputs: PropTypes.bool,
  inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  inputsTotalSats: PropTypes.shape(bigNumberPropTypes).isRequired,
  outputs: PropTypes.arrayOf(
    PropTypes.shape({
      address: PropTypes.string,
      amount: PropTypes.string,
      addressError: PropTypes.string,
      amountError: PropTypes.string,
    })
  ).isRequired,
  resetNodesSpend: PropTypes.func.isRequired,
  setSpendStep: PropTypes.func.isRequired,
  spendingStep: PropTypes.number,
  updateAutoSpend: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
};

WalletSpend.defaultProps = {
  autoSpend: false,
  balanceError: null,
  changeNodes: {},
  depositNodes: {},
  finalizedOutputs: false,
  feeError: null,
  feeRateError: null,
  spendingStep: 0,
};

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
  autoSelectCoins: autoSelectCoinsAction,
  deleteChangeOutput: deleteChangeOutputAction,
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
  importPSBT,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletSpend);
