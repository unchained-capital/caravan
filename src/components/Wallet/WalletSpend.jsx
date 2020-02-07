import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import BigNumber from 'bignumber.js'

// Actions
import {
  updateDepositNodeAction,
  updateChangeNodeAction,
  resetNodesSpend,
} from "../../actions/walletActions";
import {
  setInputs,
  setFeeRate,
  addOutput,
  setOutputAddress,
  updateAutoSpendAction,
  setChangeAddressAction,
 } from "../../actions/transactionActions";

// Components
import NodeSet from "./NodeSet";
import OutputsForm from '../Spend/OutputsForm';
import WalletSign from './WalletSign'
import {
    Box, Grid, Switch,
    FormControlLabel,
  } from '@material-ui/core';

import { bitcoinsToSatoshis } from 'unchained-bitcoin/lib/utils';


class WalletSpend extends React.Component {

  static propTypes = {
    addNode: PropTypes.func.isRequired,
    updateNode: PropTypes.func.isRequired,
    setFeeRate: PropTypes.func.isRequired,
    coinSelection: PropTypes.func.isRequired,
  };

  outputsAmount = new BigNumber(0);
  feeAmount = new BigNumber(0);

  componentWillReceiveProps(nextProps) {
    if (nextProps.autoSpend) {
      setTimeout(this.selectCoins, 0);
    }
  }

  componentDidMount = () => {
    const { changeNode, setChangeAddress } = this.props;
    setChangeAddress(changeNode.multisig.address);
  }

  render() {
    const { finalizedOutputs } = this.props;
    return (
      <Box>
        <Grid container>
          <Grid item md={12}>
          <Box>
              { finalizedOutputs ?
                <WalletSign/> :
                this.renderSpend()
              }
            </Box>
          </Grid>
          {!finalizedOutputs &&
          <Grid item md={12}>
            <Box mt={2}>
              <OutputsForm />
            </Box>
          </Grid>
          }
        </Grid>
      </Box>
    )
  }

  renderSpend = () => {
    const { addNode, updateNode, autoSpend } = this.props;
    return (
      <Box>
          <FormControlLabel
            control={
              <Switch
                checked={!autoSpend}
                onChange={this.handleSpendMode}
              />
            }
            label="Choose your own inputs"
          />
          <Box component="div" display={autoSpend ? 'none' : 'block'}>
            <NodeSet addNode={addNode} updateNode={updateNode}  />
          </Box>
      </Box>)
  }

    handleSpendMode = (event) => {
      const { updateAutoSpend } = this.props;
      if (event.target.checked) {
        // select inputs for transaction
        // select change address???,
        // how to identify???
        // calculate change???

      }

      updateAutoSpend(!event.target.checked)
    }

    selectCoins = () => {
      const { outputs, setInputs, fee, depositNodes, changeNodes, feeRate, changeOutputIndex, autoSpend,
        updateChangeNode, updateDepositNode, resetNodesSpend, setFeeRate, coinSelection } = this.props;
      const outputsAmount = outputs.reduce((sum, output, outputIndex) => {
        return changeOutputIndex === outputIndex + 1 ? sum : sum.plus(output.amountSats)
      }, new BigNumber(0));
      if (outputsAmount.isNaN()) return;
      const feeAmount = bitcoinsToSatoshis(new BigNumber(fee));
      if (outputsAmount.isEqualTo(this.outputsAmount) && feeAmount.isEqualTo(this.feeAmount)) return;
      const outputTotal = outputsAmount.plus(feeAmount);
      const spendableInputs = Object.values(depositNodes)
        .concat(Object.values(changeNodes))
        .filter(node => node.balanceSats.isGreaterThan(0));

      resetNodesSpend();
      const selectedInputs = coinSelection(spendableInputs, outputTotal);

      selectedInputs.forEach(selectedUtxo => {
        (selectedUtxo.change ? updateChangeNode : updateDepositNode)({bip32Path: selectedUtxo.bip32Path, spend: true})
      })

      this.outputsAmount = outputsAmount;
      this.feeAmount = feeAmount;
      setInputs(selectedInputs);
      if (changeOutputIndex > 0 || !autoSpend) setFeeRate(feeRate); // recalulate fee
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
  setInputs,
  updateChangeNode: updateChangeNodeAction,
  updateDepositNode: updateDepositNodeAction,
  setAddress: setOutputAddress,
  resetNodesSpend,
  setFeeRate,
  addOutput,
  setChangeAddress: setChangeAddressAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletSpend);
