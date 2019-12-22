import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js'

// Actions
import {
  updateAutoSpendAction,
  updateDepositNodeAction,
  updateChangeNodeAction,
  resetNodesSpend,
} from "../../actions/walletActions";
import {
  setInputs,
  setFeeRate,
  addOutput,
  setOutputAddress,
 } from "../../actions/transactionActions";

// Components
import NodeSet from "./NodeSet";
import OutputsForm from '../Spend/OutputsForm';
import WalletSign from './WalletSign'
import {
    Box, Card, CardHeader,
    CardContent, Grid, Switch,
  } from '@material-ui/core';

import { bitcoinsToSatoshis } from 'unchained-bitcoin/lib/utils';

let coinSelectTimer;

class WalletSpend extends React.Component {

  static propTypes = {
    addNode: PropTypes.func.isRequired,
    updateNode: PropTypes.func.isRequired,
    setFeeRate: PropTypes.func.isRequired,
    coinSelection: PropTypes.func.isRequired,
  };

  state = {
    outputsAmount: new BigNumber(0),
    feeAmount: new BigNumber(0)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.autoSpend) {
      if (coinSelectTimer) clearTimeout(coinSelectTimer)
      coinSelectTimer = setTimeout(this.selectCoins, 1000);
    }
  }

  componentWillUnmount() {
    if (coinSelectTimer) clearTimeout(coinSelectTimer)
  }

  render() {
    const { finalizedOutputs } = this.props;
    return (
      <Box>
        <Grid container>
          <Grid item md={12}>
            <OutputsForm />
          </Grid>
          <Grid item md={12}>
            <Box mt={2}>
              { finalizedOutputs ?
                <WalletSign/> :
                this.renderSpend()
              }
            </Box>
          </Grid>
        </Grid>
      </Box>
    )
  }

  renderSpend = () => {
    const { addNode, updateNode, autoSpend } = this.props;
    return (
      <Card>
        <CardHeader title="Spend"/>
        <CardContent>
          <Grid item md={12}>
            <Grid component="label" container alignItems="center" spacing={1}>
              <Grid item>Manual</Grid>
              <Grid item>
                <Switch
                  checked={autoSpend}
                  onChange={this.handleSpendMode}
              />
              </Grid>
              <Grid item>Auto</Grid>
            </Grid>
          </Grid>
          <NodeSet addNode={addNode} updateNode={updateNode} />
        </CardContent>
      </Card>)
  }

    handleSpendMode = (event) => {
      const { updateAutoSpend } = this.props;
      if (event.target.checked) {
        // select inputs for transaction
        // select change address???,
        // how to identify???
        // calculate change???

      }

      updateAutoSpend(event.target.checked)
    }

    selectCoins = () => {
      const { outputs, setInputs, fee, depositNodes, changeNodes, feeRate,
        updateChangeNode, updateDepositNode, resetNodesSpend, setFeeRate, coinSelection } = this.props;
      const outputsAmount = outputs.reduce((sum, output) => sum.plus(output.amountSats), new BigNumber(0));
      if (outputsAmount.isNaN()) return;
      const feeAmount = bitcoinsToSatoshis(new BigNumber(fee));
      if (outputsAmount.isEqualTo(this.state.outputsAmount) && feeAmount.isEqualTo(this.state.feeAmount)) return;
      const outputTotal = outputsAmount.plus(feeAmount);
      const spendableInputs = Object.values(depositNodes)
        .concat(Object.values(changeNodes))
        .filter(node => node.balanceSats.isGreaterThan(0));

      resetNodesSpend();
      const selectedInputs = coinSelection(spendableInputs, outputTotal);

      selectedInputs.forEach(selectedUtxo => {
        (selectedUtxo.change ? updateChangeNode : updateDepositNode)({bip32Path: selectedUtxo.bip32Path, spend: true})
      })

      this.setState({ outputsAmount, feeAmount })
      setInputs(selectedInputs);
      setFeeRate(feeRate); // recalulate fee
    }
}

function mapStateToProps(state) {
  return {
    ...state.spend.transaction,
    changeNodes: state.wallet.change.nodes,
    changeNode: state.wallet.change.nextNode,
    depositNodes: state.wallet.deposits.nodes,
    autoSpend: state.wallet.info.autoSpend,
  };
}

const mapDispatchToProps = {
  updateAutoSpend: updateAutoSpendAction,
  setInputs,
  updateChangeNode: updateChangeNodeAction,
  updateDepositNode: updateDepositNodeAction,
  setAddress: setOutputAddress,
  resetNodesSpend,
  setFeeRate,
  addOutput,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletSpend);
