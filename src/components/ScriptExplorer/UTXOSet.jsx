import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  blockExplorerTransactionURL,
  satoshisToBitcoins,
} from "unchained-bitcoin";
import {externalLink} from "../../utils";
import Copyable from "../Copyable";

// Components
import {
  Table, TableHead, TableBody, TableFooter,
  TableRow, TableCell, Typography,
} from '@material-ui/core';
import { OpenInNew } from '@material-ui/icons';

// Assets
import 'react-table/react-table.css';
import styles from './styles.module.scss';

class UTXOSet extends React.Component {

  static propTypes = {
    network: PropTypes.string.isRequired,
    inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    inputsTotalSats: PropTypes.object.isRequired,
  };

  render() {
    const {inputs, inputsTotalSats} = this.props;
    return (
      <>
        <Typography variant="h5">{`Available Inputs (${inputs.length})`} </Typography>
          <p>The following UTXOs will be spent as inputs in a new transaction.</p>
          <Table>
            <TableHead>
              <TableRow hover>
                <TableCell>Number</TableCell>
                <TableCell>TXID</TableCell>
                <TableCell>Index</TableCell>
                <TableCell>Amount (BTC)</TableCell>
                <TableCell>View</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.renderInputs()}
            </TableBody>
            <TableFooter>
              <TableRow hover>
                <TableCell colSpan={3}>
                  TOTAL:
                </TableCell>
                <TableCell colSpan={2}>
                  {satoshisToBitcoins(inputsTotalSats).toString()}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

      </>
    );
  }

  renderInputs = () => {
    const { inputs, network } = this.props;
    return inputs.map((input, inputIndex) => {
      const confirmedStyle = `${styles.utxoTxid}${input.confirmed ? '' : ' '+styles.unconfirmed}`;
      const confirmedTitle = input.confirmed ? 'confirmed' : 'unconfirmed';
      return (
        <TableRow hover key={input.txid}>
          <TableCell>
            {inputIndex + 1}
          </TableCell>
          <TableCell className={confirmedStyle}>
            <Copyable text={input.txid}>
              <code title={confirmedTitle}>{input.txid}</code>
            </Copyable>
          </TableCell>
          <TableCell>
            <Copyable text={input.index.toString()} />
          </TableCell>
          <TableCell>
            <Copyable text={satoshisToBitcoins(input.amountSats).toString()} />
          </TableCell>
          <TableCell>
            {externalLink(blockExplorerTransactionURL(input.txid, network), <OpenInNew />)}
          </TableCell>
        </TableRow>
      );
    });
  }

}

function mapStateToProps(state) {
  return {
    ...state.settings,
  };
}

export default connect(mapStateToProps)(UTXOSet);
