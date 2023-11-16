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
} from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import BigNumber from "bignumber.js";
import { externalLink } from "utils/ExternalLink";
import Copyable from "../Copyable";

// Actions
import { setInputs as setInputsAction } from "../../actions/transactionActions";

// Assets
import styles from "./styles.module.scss";

class UTXOSet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputsSatsSelected: props.inputsTotalSats,
      localInputs: props.inputs.map((input) => {
        return {
          ...input,
          checked: props.selectAll,
        };
      }),
      toggleAll: true,
    };
  }

  componentDidUpdate(prevProps) {
    // This function exists because we need to respond to the parent node having
    // its select/spend checkbox clicked (toggling select-all or select-none).
    // None of this needs to happen on the redeem script interface.
    const { multisig, autoSpend } = this.props;
    if (multisig && !autoSpend) {
      const { node, existingTransactionInputs } = this.props;
      const { localInputs } = this.state;
      const prevMyInputsBeingSpent = this.filterInputs(
        localInputs,
        prevProps.existingTransactionInputs,
        true
      ).length;
      const myInputsBeingSpent = this.filterInputs(
        localInputs,
        existingTransactionInputs,
        true
      ).length;

      const isFullSpend = myInputsBeingSpent === localInputs.length;

      // If the spend bool on the node changes, toggleAll the checks.
      // but that's not quite enough because if a single UTXO is selected
      // then it is also marked from not spend -> spend ... so don't want
      // to toggleAll in that case. Furthermore, if you have 5 UTXOs and
      // 2 selected and *then* click select all ... we also need to toggelAll.
      if (
        (prevProps.node.spend !== node.spend ||
          myInputsBeingSpent !== prevMyInputsBeingSpent) &&
        isFullSpend
      ) {
        this.toggleAll(node.spend);
      }
    }
  }

  filterInputs = (localInputs, transactionStoreInputs, filterToMyInputs) => {
    return localInputs.filter((input) => {
      const included = transactionStoreInputs.filter((utxo) => {
        return utxo.txid === input.txid && utxo.index === input.index;
      });
      return filterToMyInputs ? included.length > 0 : included.length === 0;
    });
  };

  toggleInput = (inputIndex) => {
    const { localInputs } = this.state;
    this.setState({ toggleAll: false });

    localInputs[inputIndex].checked = !localInputs[inputIndex].checked;

    this.setInputsAndUpdateDisplay(localInputs);
  };

  toggleAll = (setTo = null) => {
    const { localInputs, toggleAll } = this.state;
    const toggled = !toggleAll;

    localInputs.forEach((input) => {
      const i = input;
      i.checked = setTo === null ? toggled : setTo;
      return i;
    });

    this.setInputsAndUpdateDisplay(localInputs);
    this.setState({ toggleAll: toggled });
  };

  setInputsAndUpdateDisplay = (incomingInputs) => {
    const {
      setInputs,
      multisig,
      bip32Path,
      existingTransactionInputs,
      setSpendCheckbox,
    } = this.props;
    const { localInputs } = this.state;
    let inputsToSpend = incomingInputs.filter((input) => input.checked);
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
    let totalInputsToSpend = inputsToSpend;

    // The following is only relevant on the wallet interface
    if (multisig) {
      // There are 3 total sets of inputs to care about:
      // 1. localInputs - all inputs from this node/address
      // 2. inputsToSpend - equal to or subset of those from #1 (inputs marked checked==true)
      // 3. existingTransactionInputs - all inputs from all nodes/addresses

      // Check if #3 contains any inputs not associated with this component
      const notMyInputs = this.filterInputs(
        existingTransactionInputs,
        localInputs,
        false
      );

      if (notMyInputs.length > 0) {
        totalInputsToSpend = inputsToSpend.concat(notMyInputs);
      }

      // Now we push a change up to the top level node so it can update its checkbox
      const numLocalInputsToSpend = inputsToSpend.length;
      if (numLocalInputsToSpend === 0) {
        setSpendCheckbox(false);
      } else if (numLocalInputsToSpend < localInputs.length) {
        setSpendCheckbox("indeterminate");
      } else {
        setSpendCheckbox(true);
      }
    }

    if (totalInputsToSpend.length > 0) {
      setInputs(totalInputsToSpend);
    } else if (multisig) {
      // If we do this on redeem script interface, the panel will disappear
      setInputs([]);
    }
  };

  renderInputs = () => {
    const { network, showSelection, finalizedOutputs } = this.props;
    const { localInputs } = this.state;
    return localInputs.map((input, inputIndex) => {
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
            <Copyable text={satoshisToBitcoins(input.amountSats)} />
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
      inputsTotalSats,
      showSelection = true,
      hideSelectAllInHeader,
      finalizedOutputs,
    } = this.props;
    const { inputsSatsSelected, toggleAll, localInputs } = this.state;
    return (
      <>
        <Typography variant="h5">
          {`Available Inputs (${localInputs.length})`}{" "}
        </Typography>
        <p>The following UTXOs will be spent as inputs in a new transaction.</p>
        <Table>
          <TableHead>
            <TableRow hover>
              {showSelection && !hideSelectAllInHeader && (
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
              {hideSelectAllInHeader && <TableCell />}
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
                  ? satoshisToBitcoins(inputsSatsSelected)
                  : satoshisToBitcoins(inputsTotalSats)}
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
  hideSelectAllInHeader: PropTypes.bool,
  selectAll: PropTypes.bool,
  finalizedOutputs: PropTypes.bool.isRequired,
  node: PropTypes.shape({
    spend: PropTypes.bool,
  }),
  existingTransactionInputs: PropTypes.arrayOf(PropTypes.shape({})),
  setSpendCheckbox: PropTypes.func,
  autoSpend: PropTypes.bool.isRequired,
};

UTXOSet.defaultProps = {
  multisig: false,
  bip32Path: "",
  showSelection: true,
  hideSelectAllInHeader: false,
  selectAll: true,
  node: {},
  existingTransactionInputs: [],
  setSpendCheckbox: () => {},
};

function mapStateToProps(state) {
  return {
    ...state.settings,
    autoSpend: state.spend.transaction.autoSpend,
    finalizedOutputs: state.spend.transaction.finalizedOutputs,
    existingTransactionInputs: state.spend.transaction.inputs,
  };
}

const mapDispatchToProps = {
  setInputs: setInputsAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(UTXOSet);
