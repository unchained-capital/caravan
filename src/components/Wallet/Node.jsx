import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { satoshisToBitcoins } from "unchained-bitcoin";

// Components
import { TableRow, TableCell, Checkbox } from "@mui/material";
import AddressExpander from "./AddressExpander";

// Actions
import {
  setInputs as setInputsAction,
  setFeeRate as setFeeRateAction,
  updateAutoSpendAction as updateAutoSpendActionImport,
} from "../../actions/transactionActions";
import { WALLET_MODES } from "../../actions/walletActions";

class Node extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      indeterminate: false,
      checked: false,
    };
  }

  componentDidMount = () => {
    this.generate();
  };

  // Passing this fn down to the UTXOSet so we can get updates here, from there.
  setSpendCheckbox = (value) => {
    const { spend } = this.props;
    if (value === "indeterminate") {
      this.setState({ indeterminate: true, checked: false });
      this.markSpending(true);
    } else if (value === spend) {
      // handles select/de-select all as well as have selected some and click select all
      this.setState({ indeterminate: false, checked: value });
      this.markSpending(value);
    } else {
      // handles the case of de-selecting one-by-one until there's nothing left selected
      // or there's only one utxo and we're selecting to spend it or not instead of at
      // the top level select-all or deselect-all
      this.setState({ indeterminate: false, checked: value });
      this.markSpending(value);
    }
  };

  markSpending = (value) => {
    const { change, bip32Path, updateNode } = this.props;
    updateNode(change, { spend: value, bip32Path });
  };

  render = () => {
    const {
      bip32Path,
      fetchedUTXOs,
      balanceSats,
      multisig,
      utxos,
      walletMode,
      addressKnown,
    } = this.props;
    const { indeterminate, checked } = this.state;
    const spending = walletMode === WALLET_MODES.SPEND;
    return (
      <TableRow key={bip32Path}>
        {spending && (
          <TableCell>
            <Checkbox
              id={bip32Path}
              name="spend"
              onChange={this.handleSpend}
              checked={checked}
              disabled={!fetchedUTXOs || balanceSats.isEqualTo(0)}
              indeterminate={indeterminate}
            />
          </TableCell>
        )}
        <TableCell>
          <code>{bip32Path.replace("m", "*")}</code>
        </TableCell>
        <TableCell>{utxos.length}</TableCell>
        <TableCell>
          {fetchedUTXOs && addressKnown ? satoshisToBitcoins(balanceSats) : ""}
        </TableCell>
        <TableCell>{this.maxUtxoDate()}</TableCell>

        <TableCell>{multisig ? this.renderAddress() : "..."}</TableCell>
      </TableRow>
    );
  };

  maxUtxoDate = () => {
    const { utxos } = this.props;
    if (!utxos.length) return "";
    const maxtime = Math.max(...utxos.map((utxo) => utxo.time));
    if (Number.isNaN(maxtime)) return "Pending";
    return new Date(1000 * maxtime).toLocaleDateString();
  };

  renderAddress = () => {
    const { braidNode } = this.props;
    return (
      <AddressExpander
        node={braidNode}
        setSpendCheckbox={this.setSpendCheckbox}
      />
    );
  };

  generate = () => {
    const { present, change, bip32Path, addNode } = this.props;
    if (!present) {
      addNode(change, bip32Path);
    }
  };

  handleSpend = (e) => {
    const {
      change,
      bip32Path,
      updateNode,
      inputs,
      utxos,
      multisig,
      setInputs,
      updateAutoSpend,
      setFeeRate,
      feeRate,
    } = this.props;
    let newInputs;

    if (e.target.getAttribute("data-indeterminate")) {
      // remove any inputs that are ours
      newInputs = inputs.filter((input) => {
        const newUtxos = utxos.filter((utxo) => {
          return utxo.txid === input.txid && utxo.index === input.index;
        });
        return newUtxos.length === 0;
      });
      // then add all ours back
      newInputs = newInputs.concat(
        utxos.map((utxo) => ({ ...utxo, multisig, bip32Path }))
      );
      this.setState({ indeterminate: false, checked: true });
    } else if (e.target.checked) {
      newInputs = inputs.concat(
        utxos.map((utxo) => ({ ...utxo, multisig, bip32Path }))
      );
    } else {
      newInputs = inputs.filter((input) => {
        const newUtxos = utxos.filter((utxo) => {
          return utxo.txid === input.txid && utxo.index === input.index;
        });
        return newUtxos.length === 0;
      });
    }
    setInputs(newInputs);
    updateNode(change, { spend: e.target.checked, bip32Path });
    updateAutoSpend(false);
    setFeeRate(feeRate);
  };
}

Node.propTypes = {
  addNode: PropTypes.func.isRequired,
  addressKnown: PropTypes.bool.isRequired,
  balanceSats: PropTypes.shape({
    isEqualTo: PropTypes.func,
  }).isRequired,
  bip32Path: PropTypes.string.isRequired,
  braidNode: PropTypes.shape({}).isRequired,
  change: PropTypes.bool.isRequired,
  feeRate: PropTypes.string.isRequired,
  fetchedUTXOs: PropTypes.bool.isRequired,
  inputs: PropTypes.arrayOf(
    PropTypes.shape({
      index: PropTypes.number,
      txid: PropTypes.string,
    })
  ).isRequired,
  multisig: PropTypes.shape({}),
  present: PropTypes.bool,
  setFeeRate: PropTypes.func.isRequired,
  setInputs: PropTypes.func.isRequired,
  spend: PropTypes.bool.isRequired,
  updateAutoSpend: PropTypes.func.isRequired,
  updateNode: PropTypes.func.isRequired,
  utxos: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  walletMode: PropTypes.number.isRequired,
};

Node.defaultProps = {
  multisig: {},
  present: false,
};

function mapStateToProps(state, ownProps) {
  const change = (ownProps.bip32Path || "").split("/")[1] === "1"; // // m, 0, 1
  const braid = state.wallet[change ? "change" : "deposits"];
  return {
    ...state.settings,
    ...{ change },
    ...braid.nodes[ownProps.bip32Path],
    ...state.spend.transaction,
    walletMode: state.wallet.common.walletMode,
    braidNode: braid.nodes[ownProps.bip32Path],
  };
}

const mapDispatchToProps = {
  setInputs: setInputsAction,
  setFeeRate: setFeeRateAction,
  updateAutoSpend: updateAutoSpendActionImport,
};

export default connect(mapStateToProps, mapDispatchToProps)(Node);
