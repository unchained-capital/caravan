import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { map } from "lodash";
import BigNumber from "bignumber.js";
import { bitcoinsToSatoshis, satoshisToBitcoins } from "unchained-bitcoin";

// Actions

// Components
import {
  Grid,
  Button,
  Tooltip,
  TextField,
  Box,
  IconButton,
  InputAdornment,
  Typography,
  FormHelperText,
} from "@material-ui/core";
import { Speed } from "@material-ui/icons";
import AddIcon from "@material-ui/icons/Add";
import {
  addOutput as addOutputAction,
  setOutputAmount as setOutputAmountAction,
  setOutputAddress as setOutputAddressAction,
  setFeeRate as setFeeRateAction,
  setFee as setFeeAction,
  finalizeOutputs as finalizeOutputsAction,
  resetOutputs as resetOutputsAction,
  setChangeOutputIndex as setChangeOutputIndexAction,
} from "../../actions/transactionActions";
import { fetchFeeEstimate } from "../../blockchain";
import OutputEntry from "./OutputEntry";

// Assets
import styles from "./styles.module.scss";

class OutputsForm extends React.Component {
  static unitLabel(label, options) {
    let inputProps = {
      endAdornment: (
        <InputAdornment position="end">
          <FormHelperText>{label}</FormHelperText>
        </InputAdornment>
      ),
    };
    if (options) {
      inputProps = {
        ...inputProps,
        ...options,
      };
    }
    return inputProps;
  }

  titleRef = React.createRef();

  outputsTotal = 0;

  constructor(props) {
    super(props);
    this.state = {
      feeRateFetchError: "",
    };
  }

  componentDidMount = () => {
    this.initialOutputState();
    this.scrollToTitle();
  };

  componentDidUpdate = () => {
    this.scrollToTitle();
  };

  scrollToTitle = () => {
    const { signatureImporters, isWallet } = this.props;
    const finalizedCount = Object.keys(signatureImporters).reduce(
      (o, k) => o + signatureImporters[k].finalized,
      0
    );
    if (finalizedCount === 0 && !isWallet)
      this.titleRef.current.scrollIntoView({ behavior: "smooth" });
  };

  renderOutputs = () => {
    const { outputs, changeOutputIndex, autoSpend } = this.props;
    return map(outputs).map((output, i) => (
      <Box
        key={i} // eslint-disable-line react/no-array-index-key
        display={autoSpend && changeOutputIndex === i + 1 ? "none" : "block"}
      >
        <Grid container>
          <OutputEntry number={i + 1} />
        </Grid>
      </Box>
    ));
  };

  inputsTotal = () => {
    const { inputsTotalSats } = this.props;
    return satoshisToBitcoins(inputsTotalSats);
  };

  outputsAndFeeTotal = () => {
    const { outputs, fee, updatesComplete } = this.props;

    const total = outputs
      .map((output) => new BigNumber(output.amount || 0))
      .reduce(
        (accumulator, currentValue) => accumulator.plus(currentValue),
        new BigNumber(0)
      )
      .plus(new BigNumber(fee));

    if (updatesComplete) {
      this.outputsTotal = total;
      return total;
    }
    return this.outputsTotal;
  };

  hasFeeRateFetchError = () => {
    const { feeRateFetchError } = this.state;
    return feeRateFetchError !== "";
  };

  hasFeeRateError = () => {
    const { feeRateError } = this.props;
    return feeRateError !== "";
  };

  hasFeeError = () => {
    const { feeError } = this.props;
    return feeError !== "";
  };

  hasBalanceError = () => {
    const { balanceError } = this.props;
    return balanceError !== "";
  };

  hasError = () => {
    return (
      this.hasFeeRateFetchError() ||
      this.hasFeeRateError() ||
      this.hasFeeError() ||
      this.hasBalanceError()
    );
  };

  handleAddOutput = () => {
    const { addOutput } = this.props;
    addOutput();
  };

  handleFeeRateChange = (event) => {
    const { setFeeRate, inputs } = this.props;
    let rate = event.target.value;
    // eslint-disable-next-line use-isnan
    if (rate === "" || parseFloat(rate, 10) === NaN || parseFloat(rate, 10) < 1)
      rate = "0";
    if (inputs.length) setFeeRate(rate);
  };

  handleFeeChange = (event) => {
    const { setFee } = this.props;
    setFee(event.target.value);
  };

  handleFinalize = () => {
    const { finalizeOutputs } = this.props;
    finalizeOutputs(true);
  };

  handleReset = () => {
    const { resetOutputs, isWallet } = this.props;
    resetOutputs();
    if (!isWallet) setTimeout(() => this.initialOutputState(), 0);
  };

  getFeeEstimate = async () => {
    const { client, network, setFeeRate } = this.props;
    let newFeeRate = 1;
    let feeRateFetchError = "";
    try {
      newFeeRate = await fetchFeeEstimate(network, client);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      feeRateFetchError = "There was an error fetching the fee rate.";
    } finally {
      setFeeRate(newFeeRate.toString());
      this.setState({ feeRateFetchError });
    }
  };

  gatherSignaturesDisabled = () => {
    const { finalizedOutputs, outputs, inputs } = this.props;
    if (inputs.length === 0) return true;
    if (finalizedOutputs || this.hasError()) {
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

  async initialOutputState() {
    const {
      inputs,
      outputs,
      isWallet,
      change,
      setChangeOutputIndex,
      addOutput,
      setOutputAddress,
      changeOutputIndex,
    } = this.props;
    await this.getFeeEstimate();
    const { inputsTotalSats, fee, setOutputAmount } = this.props;
    const feeSats = bitcoinsToSatoshis(new BigNumber(fee));
    const outputAmount = satoshisToBitcoins(inputsTotalSats.minus(feeSats));
    // only initialize once so we don't lose state
    if (inputs.length && outputs[0].amount === "")
      setOutputAmount(1, outputAmount.toFixed(8));

    if (isWallet && changeOutputIndex === 0) {
      addOutput();
      setOutputAddress(2, change.nextNode.multisig.address);
      setChangeOutputIndex(2);
      setOutputAmount(2, BigNumber(0).toFixed(8));
    }
  }

  render() {
    const {
      feeRate,
      fee,
      finalizedOutputs,
      feeRateError,
      feeError,
      balanceError,
      inputs,
      isWallet,
      autoSpend,
    } = this.props;
    const { feeRateFetchError } = this.state;
    const feeDisplay = inputs && inputs.length > 0 ? fee : "0.0000";
    const feeMt = 3;
    const totalMt = 7;
    const actionMt = 7;
    const gridSpacing = isWallet ? 10 : 1;
    return (
      <>
        <Box ref={this.titleRef}>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={4}>
              <Typography variant="caption" className={styles.outputsFormLabel}>
                To
              </Typography>
            </Grid>
            <Grid item xs={3}>
              &nbsp;
            </Grid>
            <Grid item xs={3}>
              <Typography variant="caption" className={styles.outputsFormLabel}>
                Amount
              </Typography>
            </Grid>
          </Grid>

          <Grid>{this.renderOutputs()}</Grid>

          <Grid item container spacing={gridSpacing}>
            <Grid item xs={12}>
              <Button
                color="primary"
                disabled={finalizedOutputs}
                onClick={this.handleAddOutput}
              >
                <AddIcon /> Add output
              </Button>
            </Grid>
          </Grid>
          <Grid item container spacing={gridSpacing}>
            <Grid item xs={3}>
              <Box mt={feeMt}>
                <Typography
                  variant="caption"
                  className={styles.outputsFormLabel}
                >
                  Fee Rate
                </Typography>
                <TextField
                  fullWidth
                  value={feeRate}
                  type="number"
                  minimum={0}
                  step={1}
                  name="fee_rate"
                  disabled={finalizedOutputs}
                  onChange={this.handleFeeRateChange}
                  error={this.hasFeeRateError()}
                  helperText={feeRateFetchError || feeRateError}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip placement="top" title="Estimate best rate">
                          <small>
                            <IconButton
                              onClick={this.getFeeEstimate}
                              disabled={finalizedOutputs}
                            >
                              <Speed />
                            </IconButton>
                          </small>
                        </Tooltip>
                        <FormHelperText>Sats/byte</FormHelperText>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Grid>

            <Grid item xs={4}>
              <Box mt={feeMt}>&nbsp;</Box>
            </Grid>
            {!isWallet || (isWallet && !autoSpend) ? (
              <Grid item xs={3}>
                <Box mt={feeMt}>
                  <Typography
                    variant="caption"
                    className={styles.outputsFormLabel}
                  >
                    Estimated Fees
                  </Typography>
                  <TextField
                    fullWidth
                    name="fee_total"
                    disabled={finalizedOutputs}
                    value={feeDisplay}
                    onChange={this.handleFeeChange}
                    error={this.hasFeeError()}
                    helperText={feeError}
                    InputProps={OutputsForm.unitLabel("BTC", {
                      readOnly: true,
                      disableUnderline: true,
                      style: { color: "gray" },
                    })}
                  />
                </Box>
              </Grid>
            ) : (
              ""
            )}

            <Grid item xs={2} />
          </Grid>

          <Grid item container spacing={gridSpacing}>
            <Grid item xs={4}>
              <Box mt={totalMt}>
                <Typography variant="h6">
                  {!isWallet || (isWallet && !autoSpend)
                    ? "Totals"
                    : "Outputs & Fee Total"}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box
                display={
                  !isWallet || (isWallet && !autoSpend) ? "block" : "none"
                }
                mt={totalMt}
              >
                <TextField
                  fullWidth
                  label="Inputs Total"
                  readOnly
                  value={this.inputsTotal().toString()}
                  disabled={finalizedOutputs}
                  InputProps={OutputsForm.unitLabel("BTC", { readOnly: true })}
                />
              </Box>
            </Grid>
            <Grid item xs={3}>
              <Box mt={totalMt}>
                <TextField
                  fullWidth
                  label={
                    !isWallet || (isWallet && !autoSpend)
                      ? "Outputs & Fee Total"
                      : ""
                  }
                  value={this.outputsAndFeeTotal().toString() || "0.0000"}
                  error={this.hasBalanceError()}
                  disabled={finalizedOutputs}
                  helperText={balanceError}
                  InputProps={OutputsForm.unitLabel("BTC", {
                    readOnly: true,
                    disableUnderline: true,
                  })}
                />
              </Box>
            </Grid>
            <Grid item xs={2} />
          </Grid>

          {/* <Grid item> */}

          {/* </Grid> */}
        </Box>

        {!isWallet && (
          <Box mt={actionMt}>
            <Grid container spacing={3} justify="center">
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={this.gatherSignaturesDisabled()}
                  onClick={this.handleFinalize}
                >
                  Gather Signatures
                </Button>
              </Grid>

              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  disabled={finalizedOutputs}
                  onClick={this.handleReset}
                >
                  Reset Outputs
                </Button>
              </Grid>
            </Grid>
          </Box>
        )}
      </>
    );
  }
}

OutputsForm.propTypes = {
  addOutput: PropTypes.func.isRequired,
  autoSpend: PropTypes.bool.isRequired,
  balanceError: PropTypes.string.isRequired,
  change: PropTypes.shape({
    nextNode: PropTypes.shape({
      multisig: PropTypes.shape({
        address: PropTypes.string,
      }),
    }),
  }).isRequired,
  changeOutputIndex: PropTypes.number.isRequired,
  client: PropTypes.shape({}).isRequired,
  fee: PropTypes.string.isRequired,
  feeError: PropTypes.string.isRequired,
  feeRateError: PropTypes.string.isRequired,
  finalizeOutputs: PropTypes.func.isRequired,
  feeRate: PropTypes.string.isRequired,
  finalizedOutputs: PropTypes.bool.isRequired,
  inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  inputsTotalSats: PropTypes.shape({
    minus: PropTypes.func,
  }).isRequired,
  isWallet: PropTypes.bool.isRequired,
  network: PropTypes.string.isRequired,
  outputs: PropTypes.arrayOf(
    PropTypes.shape({
      address: PropTypes.string,
      addressError: PropTypes.string,
      amount: PropTypes.string,
      amountError: PropTypes.string,
    })
  ).isRequired,
  resetOutputs: PropTypes.func.isRequired,
  setFeeRate: PropTypes.func.isRequired,
  setFee: PropTypes.func.isRequired,
  setChangeOutputIndex: PropTypes.func.isRequired,
  setOutputAddress: PropTypes.func.isRequired,
  setOutputAmount: PropTypes.func.isRequired,
  signatureImporters: PropTypes.shape({}).isRequired,
  updatesComplete: PropTypes.bool,
};

OutputsForm.defaultProps = {
  updatesComplete: false,
};

function mapStateToProps(state) {
  return {
    ...{
      network: state.settings.network,
      client: state.client,
    },
    ...state.spend.transaction,
    ...state.client,
    signatureImporters: state.spend.signatureImporters,
    change: state.wallet.change,
  };
}

const mapDispatchToProps = {
  addOutput: addOutputAction,
  setOutputAmount: setOutputAmountAction,
  setFeeRate: setFeeRateAction,
  setFee: setFeeAction,
  finalizeOutputs: finalizeOutputsAction,
  resetOutputs: resetOutputsAction,
  setChangeOutputIndex: setChangeOutputIndexAction,
  setOutputAddress: setOutputAddressAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(OutputsForm);
