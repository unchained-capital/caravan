import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  blockExplorerTransactionURL,
  satoshisToBitcoins,
} from "unchained-bitcoin";
import {
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
  Typography,
  Checkbox,
} from "@material-ui/core";
import { OpenInNew } from "@material-ui/icons";
import BigNumber from "bignumber.js";
import { externalLink } from "../../utils";
import Copyable from "../Copyable";

// Actions
import { setInputs as setInputsAction } from "../../actions/transactionActions";

// Assets
import "react-table/react-table.css";
import styles from "./styles.module.scss";

class UTXOSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputsSatsSelected: props.inputsTotalSats,
      inputs: props.inputs.map((input) => {
        return {
          ...input,
          checked: true,
        };
      }),
      toggleAll: true,
    };
  }

  toggleInput = (inputIndex) => {
    const { inputs } = this.state;
    this.setState({ toggleAll: false });

    inputs[inputIndex].checked = !inputs[inputIndex].checked;

    this.setInputsAndUpdateDisplay(inputs);
  };

  toggleAll = () => {
    const { inputs, toggleAll } = this.state;
    const toggled = !toggleAll;

    inputs.forEach((input) => {
      const i = input;
      i.checked = toggled;
      return i;
    });

    this.setInputsAndUpdateDisplay(inputs);
    this.setState({ toggleAll: toggled });
  };

  setInputsAndUpdateDisplay = (inputs) => {
    const { setInputs, multisig, bip32Path } = this.props;
    let inputsToSpend = inputs.filter((input) => input.checked);
    if (multisig) {
      inputsToSpend = inputsToSpend.map((utxo) => {
        return { ...utxo, multisig, bip32Path };
      });
    }
    const satsSelected = inputsToSpend.reduce(
      (accumulator, input) => accumulator.plus(input.amountSats),
      new BigNumber(0)
    );
    this.setState({
      inputsSatsSelected: satsSelected,
    });
    if (inputsToSpend.length > 0) {
      setInputs(inputsToSpend);
    }
  };

  renderInputs = () => {
    const { network, showSelection, finalizedOutputs } = this.props;
    const { inputs } = this.state;
    return inputs.map((input, inputIndex) => {
      const confirmedStyle = `${styles.utxoTxid}${
        input.confirmed ? "" : ` ${styles.unconfirmed}`
      }`;
      const confirmedTitle = input.confirmed ? "confirmed" : "unconfirmed";
      return (
        <TableRow hover key={input.txid}>
          {showSelection && (
            <TableCell>
              <Checkbox
                data-testid={`utxo-checkbox-${inputIndex}`}
                checked={input.checked}
                onClick={() => this.toggleInput(inputIndex)}
                color="primary"
                disabled={finalizedOutputs}
              />
            </TableCell>
          )}
          <TableCell>{inputIndex + 1}</TableCell>
          <TableCell className={confirmedStyle}>
            <Copyable text={input.txid} showIcon showText={false}>
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
            {externalLink(
              blockExplorerTransactionURL(input.txid, network),
              <OpenInNew />
            )}
          </TableCell>
        </TableRow>
      );
    });
  };

  render() {
    const {
      inputs,
      inputsTotalSats,
      showSelection = true,
      finalizedOutputs,
    } = this.props;
    const { inputsSatsSelected, toggleAll } = this.state;
    return (
      <>
        <Typography variant="h5">
          {`Available Inputs (${inputs.length})`}{" "}
        </Typography>
        <p>The following UTXOs will be spent as inputs in a new transaction.</p>
        <Table>
          <TableHead>
            <TableRow hover>
              {showSelection && (
                <TableCell>
                  <Checkbox
                    data-testid="utxo-check-all"
                    checked={toggleAll}
                    onClick={() => this.toggleAll()}
                    color="primary"
                    disabled={finalizedOutputs}
                  />
                </TableCell>
              )}
              <TableCell>Number</TableCell>
              <TableCell>TXID</TableCell>
              <TableCell>Index</TableCell>
              <TableCell>Amount (BTC)</TableCell>
              <TableCell>View</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{this.renderInputs()}</TableBody>
          <TableFooter>
            <TableRow hover>
              <TableCell colSpan={3}>TOTAL:</TableCell>
              <TableCell colSpan={2}>
                {inputsSatsSelected
                  ? satoshisToBitcoins(inputsSatsSelected).toString()
                  : satoshisToBitcoins(inputsTotalSats).toString()}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </>
    );
  }
}

UTXOSet.propTypes = {
  network: PropTypes.string.isRequired,
  inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  inputsTotalSats: PropTypes.shape({}).isRequired,
  setInputs: PropTypes.func.isRequired,
  multisig: PropTypes.oneOfType([PropTypes.shape({}), PropTypes.bool]),
  bip32Path: PropTypes.string,
  showSelection: PropTypes.bool,
  finalizedOutputs: PropTypes.bool.isRequired,
};

UTXOSet.defaultProps = {
  multisig: false,
  bip32Path: "",
  showSelection: true,
};

function mapStateToProps(state) {
  return {
    ...state.settings,
    finalizedOutputs: state.spend.transaction.finalizedOutputs,
  };
}

const mapDispatchToProps = {
  setInputs: setInputsAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(UTXOSet);
