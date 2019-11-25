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
  setFeeRate,
  setFee,
  finalizeOutputs,
  resetOutputs,
} from '../../actions/transactionActions';

// Components
import {
  Card, CardHeader, CardContent,
  Grid, Button, Tooltip, TextField,
  Box, IconButton, InputAdornment,
} from "@material-ui/core";
import {Speed} from "@material-ui/icons";
import OutputEntry from './OutputEntry';

class OutputsForm extends React.Component {

  titleRef = React.createRef();

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
    const { signatureImporters } = this.props;
    const finalizedCount = Object.keys(signatureImporters).reduce((o, k) => o + (signatureImporters[k].finalized), 0);
    if(finalizedCount === 0) this.titleRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  async initialOutputState() {
    const { inputs, outputs } = this.props;
    await this.getFeeEstimate();
    const {inputsTotalSats, fee, setOutputAmount} = this.props;
    const feeSats = bitcoinsToSatoshis(new BigNumber(fee));
    const outputAmount = satoshisToBitcoins(inputsTotalSats.minus(feeSats));
    // onliy initialize once so we don't lose state
    if (inputs.length && outputs[0].amount === '') setOutputAmount(1, outputAmount.toFixed(8));
  }

  render() {
    const {feeRate, fee, finalizedOutputs, feeRateError, feeError, balanceError} = this.props;
    const {feeRateFetchError} = this.state;
    return (
      <Card>
        <CardHeader ref={this.titleRef} title="Define Outputs"/>
        <CardContent>
            <Box>
              <Grid>
              {this.renderOutputs()}
              </Grid>

              <Grid item container spacing={1}>

                <Grid item xs={4}>
                  <Button
                    variant="contained"
                    disabled={finalizedOutputs}
                    onClick={this.handleAddOutput}
                  >
                    Add output
                  </Button>
                </Grid>

                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Fee Rate (Sats/byte)"
                    value={feeRate}
                    placeholder="Sats/byte"
                    name="fee_rate"
                    disabled={finalizedOutputs}
                    onChange={this.handleFeeRateChange}
                    error={this.hasFeeRateError()}
                    helperText={feeRateFetchError || feeRateError}
                    /* type="number" */
                    InputProps={{
                      /* min: "0", */
                      /* max: "1000", */
                      /* step: "any", */
                      endAdornment: <InputAdornment position="end">
                                      <Tooltip placement='top' title='Estimate best rate'>
                                        <small>
                                          <IconButton onClick={this.getFeeEstimate}  disabled={finalizedOutputs}>
                                            <Speed />
                                          </IconButton>
                                        </small>
                                      </Tooltip>
                                    </InputAdornment>,
                    }}
                  />
                </Grid>


                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Estimated Fees (BTC)"
                    placeholder="BTC"
                    name="fee_total"
                    disabled={finalizedOutputs}
                    value={fee}
                    onChange={this.handleFeeChange}
                    error={this.hasFeeError()}
                    helperText={feeError}
                    /* type="number" */
                    /* InputProps={{ */
                    /*   min: "0.00000001", */
                    /*   max: "0.025", */
                    /*   step: "0.00000001", */
                    /* }} */
                  />
                </Grid>

                <Grid item xs={2}/>

              </Grid>

              <Grid item container spacing={1}>
                <Grid item xs={4}/>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Inputs Total"
                    readOnly={true}
                    value={this.inputsTotal().toString()}
                    disabled={finalizedOutputs}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    fullWidth
                    label="Outputs & Fee Total"
                    value={this.outputsAndFeeTotal().toString()}
                    error={this.hasBalanceError()}
                    disabled={finalizedOutputs}
                    helperText={balanceError}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
                <Grid item xs={2}/>
              </Grid>

              <Grid item>

                <Grid container spacing={3}>

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

              </Grid>

            </Box>



        </CardContent>
      </Card>
    );
  }

  renderOutputs = () => {
    const { outputs } = this.props;
    return map(outputs).map((output, i) => (
      <Grid container key={i}>
        <OutputEntry number={i+1} />
      </Grid>
    ));
  }

  inputsTotal = () => {
    const {inputsTotalSats} = this.props;
    return satoshisToBitcoins(inputsTotalSats);
  }

  outputsAndFeeTotal = () => {
    const {outputs, fee, inputs} = this.props;
    if (!inputs.length) return '';
    return outputs
      .map((output) => new BigNumber(output.amount || 0))
      .reduce(
        (accumulator, currentValue) => accumulator.plus(currentValue),
        new BigNumber(0))
      .plus(new BigNumber(fee));
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
    finalizeOutputs();
  };

  handleReset = () => {
    const { resetOutputs } = this.props;
    resetOutputs();
    this.initialOutputState();
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
  };
}

const mapDispatchToProps = {
  addOutput,
  setOutputAmount,
  setFeeRate,
  setFee,
  finalizeOutputs,
  resetOutputs,
};

export default connect(mapStateToProps, mapDispatchToProps)(OutputsForm);
