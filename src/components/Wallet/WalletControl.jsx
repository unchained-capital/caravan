import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Tabs, Tab, Box, LinearProgress } from "@material-ui/core";
import {
  setWalletModeAction as setWalletModeActionImport,
  initialLoadComplete as initialLoadCompleteAction,
  WALLET_MODES,
} from "../../actions/walletActions";
import { setRequiredSigners as setRequiredSignersAction } from "../../actions/transactionActions";
import { MAX_FETCH_UTXOS_ERRORS, MAX_TRAILING_EMPTY_NODES } from "./constants";

// Components

import WalletDeposit from "./WalletDeposit";
import WalletSpend from "./WalletSpend";
import { SlicesTableContainer } from "../Slices";

class WalletControl extends React.Component {
  scrollRef = React.createRef();

  componentDidMount = () => {
    this.scrollRef.current.scrollIntoView({ behavior: "smooth" });
  };

  render = () => {
    const { walletMode } = this.props;
    return (
      <div>
        <Tabs
          ref={this.scrollRef}
          value={walletMode}
          onChange={this.handleModeChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label="Addresses" value={WALLET_MODES.VIEW} />
          <Tab label="Receive" value={WALLET_MODES.DEPOSIT} />
          <Tab label="Send" value={WALLET_MODES.SPEND} />
        </Tabs>
        <Box mt={2}>{this.renderModeComponent()}</Box>
      </div>
    );
  };

  renderModeComponent = () => {
    const { walletMode, addNode, updateNode } = this.props;
    if (this.addressesAreLoaded()) {
      if (walletMode === WALLET_MODES.DEPOSIT) return <WalletDeposit />;
      if (walletMode === WALLET_MODES.SPEND)
        return <WalletSpend addNode={addNode} updateNode={updateNode} />;
      if (walletMode === WALLET_MODES.VIEW) return <SlicesTableContainer />;
      return "";
    }
    const progress = this.progress();
    return <LinearProgress variant="determinate" value={progress} />;
  };

  progress = () => {
    const { change, deposits } = this.props;
    return (
      (100 * (deposits.trailingEmptyNodes + change.trailingEmptyNodes)) /
      (2 * MAX_TRAILING_EMPTY_NODES)
    );
  };

  addressesAreLoaded = () => {
    const { change, deposits, nodesLoaded, initialLoadComplete } = this.props;
    if (nodesLoaded) return true;
    if (
      (deposits.trailingEmptyNodes >= MAX_TRAILING_EMPTY_NODES ||
        deposits.fetchUTXOsErrors >= MAX_FETCH_UTXOS_ERRORS) &&
      (change.trailingEmptyNodes >= MAX_TRAILING_EMPTY_NODES ||
        change.fetchUTXOsErrors >= MAX_FETCH_UTXOS_ERRORS)
    ) {
      initialLoadComplete();
      return true;
    }
    return false;
  };

  handleModeChange = (_event, mode) => {
    const {
      setMode,
      requiredSigners,
      setRequiredSigners,
      signatureImporters,
    } = this.props;
    if (
      mode === WALLET_MODES.SPEND &&
      Object.keys(signatureImporters).length !== requiredSigners
    ) {
      setRequiredSigners(requiredSigners); // this will generate signature importers
    }
    setMode(mode);
  };
}

WalletControl.propTypes = {
  addNode: PropTypes.func.isRequired,
  change: PropTypes.shape({
    trailingEmptyNodes: PropTypes.number,
    fetchUTXOsErrors: PropTypes.number,
  }).isRequired,
  deposits: PropTypes.shape({
    trailingEmptyNodes: PropTypes.number,
    fetchUTXOsErrors: PropTypes.number,
  }).isRequired,
  initialLoadComplete: PropTypes.func.isRequired,
  nodesLoaded: PropTypes.bool.isRequired,
  requiredSigners: PropTypes.number.isRequired,
  setMode: PropTypes.func.isRequired,
  setRequiredSigners: PropTypes.func.isRequired,
  signatureImporters: PropTypes.shape({}).isRequired,
  updateNode: PropTypes.func.isRequired,
  walletMode: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    ...state.wallet,
    ...state.wallet.common,
    requiredSigners: state.spend.transaction.requiredSigners,
    signatureImporters: state.spend.signatureImporters,
  };
}

const mapDispatchToProps = {
  setMode: setWalletModeActionImport,
  setRequiredSigners: setRequiredSignersAction,
  initialLoadComplete: initialLoadCompleteAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletControl);
