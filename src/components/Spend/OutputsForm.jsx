import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { map } from 'lodash';
import BigNumber from 'bignumber.js';
import { fetchFeeEstimate } from '../../blockchain';
import {
  bitcoinsToSatoshis,
  satoshisToBitcoins,
} from 'unchained-bitcoin';

// Actions
import {
  addOutput,
  setOutputAmount,
  setOutputAddress,
  setFeeRate,
  setFee,
  finalizeOutputs,
  resetOutputs,
  setChangeOutputIndex,
} from '../../actions/transactionActions';

// Components
import {
  Grid, Button, Tooltip, TextField,
  Box, IconButton, InputAdornment,
  Typography,
  FormHelperText,
} from "@material-ui/core";
import {Speed} from "@material-ui/icons";
import AddIcon from '@material-ui/icons/Add';
import OutputEntry from './OutputEntry';

// Assets
import styles from './styles.module.scss';

class OutputsForm extends React.Component {

  titleRef = React.createRef();

  outputsTotal = 0;

  static propTypes = {
    network: PropTypes.string.isRequired,
    client: PropTypes.object.isRequired,
    inputsTotalSats: PropTypes.object.isRequired,
    outputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    fee: PropTypes.string.isRequired,
    feeRate: PropTypes.string.isRequired,
    finalizedOutputs: PropTypes.bool.isRequired,
    signatureImporters: PropTypes.shape({}).isRequired,
    setFeeRate: PropTypes.func.isRequired,
    setFee: PropTypes.func.isRequired,
    addOutput: PropTypes.func.isRequired,
    setOutputAmount: PropTypes.func.isRequired,
    resetOutputs: PropTypes.func.isRequired,
    finalizeOutputs: PropTypes.func.isRequired,
    feeRateError: PropTypes.string.isRequired,
    feeError: PropTypes.string.isRequired,
    balanceError: PropTypes.string.isRequired,
  };

  state = {
    feeRateFetchError: '',
  };

  componentDidMount = () => {
    this.initialOutputState();
    this.scrollToTitle();
  }

  componentDidUpdate = () => {
    this.scrollToTitle();
  }

  scrollToTitle = () => {
    const { signatureImporters, isWallet } = this.props;
    const finalizedCount = Object.keys(signatureImporters).reduce((o, k) => o + (signatureImporters[k].finalized), 0);
    if(finalizedCount === 0 && !isWallet) this.titleRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  async initialOutputState() {
    const { inputs, outputs, isWallet,
      change, setChangeOutputIndex, addOutput, setOutputAddress, changeOutputIndex } = this.props;
    await this.getFeeEstimate();
    const {inputsTotalSats, fee, setOutputAmount} = this.props;
    const feeSats = bitcoinsToSatoshis(new BigNumber(fee));
    const outputAmount = satoshisToBitcoins(inputsTotalSats.minus(feeSats));
    // onliy initialize once so we don't lose state
    if (inputs.length && outputs[0].amount === '') setOutputAmount(1, outputAmount.toFixed(8));

    if (isWallet && changeOutputIndex === 0) {
      addOutput();
      setOutputAddress(2, change.nextNode.multisig.address)
      setChangeOutputIndex(2);
      setOutputAmount(2, BigNumber(0).toFixed(8));
    }
  }

  render() {
    const {feeRate, fee, finalizedOutputs, feeRateError, feeError, balanceError, inputs,
           isWallet, autoSpend} = this.props;
    const {feeRateFetchError} = this.state;
    const feeDisplay = inputs && inputs.length > 0 ? fee : "0.0000";
    const feeMt = 3;
    const totalMt = 7;
    const actionMt = 7;
    const gridSpacing = isWallet ? 10 : 1;
    return (
        <React.Fragment>
          <Box ref={this.titleRef}>

            <Grid container spacing={gridSpacing}>
              <Grid item xs={4}>
                <Typography variant="caption" className={styles.outputsFormLabel}>
                  To
                </Typography>
              </Grid>
              <Grid item xs={3}>&nbsp;</Grid>
              <Grid item xs={3}>
                <Typography variant="caption" className={styles.outputsFormLabel}>
                  Amount
                </Typography>
              </Grid>
            </Grid>

            <Grid>
            {this.renderOutputs()}
            </Grid>

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
                <Typography variant="caption" className={styles.outputsFormLabel}>
                  Fee Rate
                </Typography>
                <TextField
                  fullWidth
                  value={feeRate}
                  name="fee_rate"
                  disabled={finalizedOutputs}
                  onChange={this.handleFeeRateChange}
                  error={this.hasFeeRateError()}
                  helperText={feeRateFetchError || feeRateError}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">
                                    <Tooltip placement='top' title='Estimate best rate'>
                                      <small>
                                        <IconButton onClick={this.getFeeEstimate}  disabled={finalizedOutputs}>
                                          <Speed />
                                        </IconButton>
                                      </small>
                                    </Tooltip>
                                    <FormHelperText>Sats/byte</FormHelperText>
                                  </InputAdornment>,
                  }}
                />
                </Box>
              </Grid>

              <Grid item xs={4}><Box mt={feeMt}>&nbsp;</Box></Grid>

              <Grid item xs={3}>
              <Box mt={feeMt}>
              <Typography variant="caption" className={styles.outputsFormLabel}>
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
                  InputProps={this.unitLabel('BTC', {readOnly: true, disableUnderline: true, style: {color: "gray"}})}
                /></Box>
              </Grid>

              <Grid item xs={2}/>

            </Grid>

            <Grid item container spacing={gridSpacing}>
              <Grid item xs={4}>
              <Box mt={totalMt}>
              <Typography variant="h6">{!isWallet || (isWallet && !autoSpend) ? "Totals" : "Outputs & Fee Total"}</Typography>
              </Box>
              </Grid>
              <Grid item xs={3}>
                <Box display={(!isWallet || (isWallet && !autoSpend)) ? 'block' : 'none'} mt={totalMt}>
                <TextField
                  fullWidth
                  label="Inputs Total"
                  readOnly={true}
                  value={this.inputsTotal().toString()}
                  disabled={finalizedOutputs}
                  InputProps={this.unitLabel('BTC', {readOnly: true})}
                />
                </Box>
              </Grid>
              <Grid item xs={3}>
              <Box mt={totalMt}>
                <TextField
                  fullWidth
                  label={!isWallet || (isWallet && !autoSpend) ? "Outputs & Fee Total" : ""}
                  value={this.outputsAndFeeTotal().toString() || "0.0000"}
                  error={this.hasBalanceError()}
                  disabled={finalizedOutputs}
                  helperText={balanceError}
                  InputProps={this.unitLabel('BTC', {readOnly: true, disableUnderline: true})}
                /></Box>
              </Grid>
              <Grid item xs={2}/>
            </Grid>

            {/* <Grid item> */}


            {/* </Grid> */}

          </Box>

          {!isWallet &&
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
          </Box>}

        </React.Fragment>

    );
  }

  unitLabel(label, options) {
    let inputProps = {
      endAdornment: <InputAdornment position="end"><FormHelperText>{label}</FormHelperText></InputAdornment>
    }
    if (options) {
      inputProps = {
        ...inputProps,
        ...options,
      }
    }
    return inputProps
  }

  renderOutputs = () => {
    const { outputs, changeOutputIndex, autoSpend } = this.props;
    return map(outputs).map((output, i) => (
      <Box key={i} display={(autoSpend && changeOutputIndex === i+1) ? 'none' : 'block'}>
        <Grid container>
          <OutputEntry number={i+1} />
        </Grid>
      </Box>
    ));
  }

  inputsTotal = () => {
    const {inputsTotalSats} = this.props;
    return satoshisToBitcoins(inputsTotalSats);
  }

  outputsAndFeeTotal = () => {
    const {outputs, fee, inputs, updatesComplete} = this.props;
    if (!inputs.length) return '';

    const total = outputs
    .map((output) => new BigNumber(output.amount || 0))
    .reduce(
      (accumulator, currentValue) => accumulator.plus(currentValue),
      new BigNumber(0))
    .plus(new BigNumber(fee));

    if (updatesComplete) {
      this.outputsTotal = total;
      return total;
    } else {
      return this.outputsTotal;
    }
  }

  hasFeeRateFetchError = () => {
    const {feeRateFetchError} = this.state;
    return feeRateFetchError !== '';
  }

  hasFeeRateError = () => {
    const {feeRateError} = this.props;
    return feeRateError !== '';
  }

  hasFeeError = () => {
    const {feeError} = this.props;
    return feeError !== '';
  }

  hasBalanceError = () => {
    const {balanceError} = this.props;
    return balanceError !== '';
  }

  hasError = () => {
    return (
      this.hasFeeRateFetchError()
        || this.hasFeeRateError()
        || this.hasFeeError()
        || this.hasBalanceError()
    );
  }

  handleAddOutput = () => {
    const {addOutput} = this.props;
    addOutput();
  };

  handleFeeRateChange = (event) => {
    const {setFeeRate, inputs} = this.props;
    if (inputs.length) setFeeRate(event.target.value);
  }

  handleFeeChange = (event) => {
    const {setFee} = this.props;
    setFee(event.target.value);
  }

  handleFinalize = () => {
    const { finalizeOutputs } = this.props;
    finalizeOutputs(true);
  };

  handleReset = () => {
    const { resetOutputs, isWallet } = this.props;
    resetOutputs();
    if (!isWallet) setTimeout(() => this.initialOutputState(),0);
  }

  getFeeEstimate = async () => {
    const {client, network, setFeeRate} = this.props;
    let newFeeRate = 1;
    let feeRateFetchError = '';
    try {
      newFeeRate = await fetchFeeEstimate(network, client);
    } catch (e){
      console.error(e);
      feeRateFetchError = 'There was an error fetching the fee rate.';
    } finally {
      setFeeRate(newFeeRate.toString());
      this.setState({feeRateFetchError});
    }
  }

  gatherSignaturesDisabled = () => {
    const {finalizedOutputs, outputs, inputs} = this.props;
    if (inputs.length === 0) return true;
    if (finalizedOutputs || this.hasError()) { return true; }
    for (var i=0; i < outputs.length; i++) {
      const output = outputs[i];
      if (output.address === '' || output.amount === '' || output.addressError !== '' || output.amountError !== '') {
        return true;
      }
    }
    return false;
  }

}

function mapStateToProps(state) {
  return {
    ...{
      network: state.settings.network,
      client: state.client,
      },
    ...state.spend.transaction,
    ...state.client,
    signatureImporters: state.spend.signatureImporters,
    change: state.wallet.change
  };
}

const mapDispatchToProps = {
  addOutput,
  setOutputAmount,
  setFeeRate,
  setFee,
  finalizeOutputs,
  resetOutputs,
  setChangeOutputIndex,
  setOutputAddress,
};

export default connect(mapStateToProps, mapDispatchToProps)(OutputsForm);
