import React from 'react';
import { connect } from 'react-redux';
import { satoshisToBitcoins } from 'unchained-bitcoin';
import BigNumber from 'bignumber.js';

// Components
import UnsignedTransaction from '../UnsignedTransaction';
import {
  Button, Box,
  Table, TableHead, TableBody, TableFooter,
  TableRow, TableCell,
  Grid, Link
} from '@material-ui/core';
class TransactionPreview extends React.Component {
  render = () => {
    const { feeRate, fee, inputsTotalSats} = this.props;


    return (
      <Box>
        <Link
          href="#"
          onClick={e => {e.preventDefault(); this.props.editTransaction();}}>Edit Transaction</Link>
        <h1>Transaction Preview</h1>
        <UnsignedTransaction/>
        <h2>Inputs</h2>
        {this.renderInputs()}
        <h2>Outputs</h2>
        {this.renderOutputs()}
        <Grid container>
          <Grid item xs={4}>
            <h2>Fee</h2>
            <div>{fee}</div>
          </Grid>
          <Grid item xs={4}>
            <h2>Fee Rate</h2>
            <div>{feeRate}</div>
          </Grid>
          <Grid item xs={4}>
            <h2>Total</h2>
            <div>{satoshisToBitcoins(BigNumber(inputsTotalSats || 0)).toString()}</div>
          </Grid>
        </Grid>
        <Grid container justify="center">
          <Box mt={5}>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={this.props.signTransaction}>Sign Transaction</Button>
          </Box>
        </Grid>

      </Box>
    )
  }

  renderAddresses = () => {
    const addressWithUtxos = this.mapAddresses()
    return Object.keys(addressWithUtxos).map(address => {
      return (
        <TableRow key={address}>
          <TableCell><code>{address}</code></TableCell>
          <TableCell>{addressWithUtxos[address].utxos.length}</TableCell>
          <TableCell><code>{addressWithUtxos[address].amount.toFixed(8)}</code></TableCell>
        </TableRow>
      )
    })
  }

  renderOutputAddresses = () => {
    const { outputs, } = this.props;

    return outputs.map(output => {
      return (
        <TableRow key={output.address}>
          <TableCell><code>{output.address}</code></TableCell>
          <TableCell><code>{BigNumber(output.amount).toFixed(8)}</code></TableCell>
        </TableRow>
      )
    })
  }

  renderOutputs = () => {
    return (
      <Table>
      <TableHead>
        <TableRow>
          <TableCell>Address</TableCell>
          <TableCell>Amount (BTC)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {this.renderOutputAddresses()}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell>TOTAL:</TableCell>
          <TableCell>{this.outputsTotal()}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>

    )

  }

  renderInputs = () => {
    const { inputsTotalSats} = this.props;

    return (
      <Table>
      <TableHead>
        <TableRow>
          <TableCell>Address</TableCell>
          <TableCell>UTXO count</TableCell>
          <TableCell>Amount (BTC)</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {this.renderAddresses()}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>
            TOTAL:
          </TableCell>
          <TableCell>
            {satoshisToBitcoins(inputsTotalSats).toString()}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>

    )
  }

  mapAddresses = () => {
    const { inputs } = this.props;
    return inputs.reduce((mapped, input) => {
      const {confirmed, txid, index, amount} = input;
      mapped[input.multisig.address] = (mapped[input.multisig.address] || {amount: BigNumber(0), utxos: []});
      mapped[input.multisig.address].utxos.push({confirmed, txid, index, amount});
      mapped[input.multisig.address].amount = mapped[input.multisig.address].amount.plus(BigNumber(input.amount))
      return mapped;
    },{})

  }

  outputsTotal = () => {
    const { outputs } = this.props;
    return satoshisToBitcoins(
      outputs.reduce(
        (total, output) => total.plus(BigNumber(output.amountSats || 0)), BigNumber(0)
      )).toString()
  }
}

function mapStateToProps(state) {
  return {
    ...state.spend.transaction,
  };  
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(TransactionPreview);

