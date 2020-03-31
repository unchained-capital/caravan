import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  setWalletModeAction,
  initialLoadComplete,
  WALLET_MODES
} from "../../actions/walletActions";
import { setRequiredSigners } from "../../actions/transactionActions";
import {naiveCoinSelection} from "../../utils"

// Components

import {
  Tabs, Tab, Box, LinearProgress,
} from '@material-ui/core';

import WalletDeposit from './WalletDeposit';
import WalletSpend from './WalletSpend';
import WalletView from './WalletView';

// TODO: centralize these, used in WalletGenerator also
const MAX_TRAILING_EMPTY_NODES = 20;
const MAX_FETCH_UTXOS_ERRORS = 5;


class WalletControl extends React.Component {
  scrollRef = React.createRef();

  static propTypes = {
    deposits: PropTypes.object.isRequired,
    change: PropTypes.object.isRequired,
    setMode: PropTypes.func.isRequired,
    setRequiredSigners: PropTypes.func.isRequired,
  };

  componentDidMount = () => {
    this.scrollRef.current.scrollIntoView({ behavior: 'smooth' });
  }

  render = () => {
    return (
      <div>
        <Tabs
          ref={this.scrollRef}
          value={this.props.walletMode}
          onChange={this.handleModeChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          >
            <Tab label="Addresses" value={WALLET_MODES.VIEW} />
            <Tab label="Receive" value={WALLET_MODES.DEPOSIT} />
            <Tab label="Send" value={WALLET_MODES.SPEND} />
        </Tabs>
        <Box mt={2}>
          {this.renderModeComponent()}
        </Box>
      </div>
    )
  }

  renderModeComponent = () => {
    const {walletMode, addNode, updateNode} = this.props;
    if (this.addressesAreLoaded() ) {
      if (walletMode === WALLET_MODES.DEPOSIT) return <WalletDeposit/>
      else if (walletMode === WALLET_MODES.SPEND) return <WalletSpend addNode={addNode} updateNode={updateNode} coinSelection={naiveCoinSelection}/>
      else if (walletMode === WALLET_MODES.VIEW) return <WalletView  addNode={addNode} updateNode={updateNode}/>
      return "";
    } else {
      const progress = this.progress();
      return <LinearProgress variant="determinate" value={progress} />
    }
  }

  progress = () => {
    const {change, deposits} = this.props;
    return 100 * (deposits.trailingEmptyNodes + change.trailingEmptyNodes) / ( 2 * MAX_TRAILING_EMPTY_NODES)
  }

  addressesAreLoaded = () => {
    const {change, deposits, nodesLoaded, initialLoadComplete} = this.props;
    if (nodesLoaded) return true;
    if (((deposits.trailingEmptyNodes >= MAX_TRAILING_EMPTY_NODES) || (deposits.fetchUTXOsErrors >= MAX_FETCH_UTXOS_ERRORS)) &&
      ((change.trailingEmptyNodes >= MAX_TRAILING_EMPTY_NODES) || (change.fetchUTXOsErrors >= MAX_FETCH_UTXOS_ERRORS))) {
        initialLoadComplete();
        return true;
      }
    return false;
  }

  handleModeChange = (_event, mode)  => {
    const { setMode,  requiredSigners, setRequiredSigners, signatureImporters  } = this.props;
    if (mode === WALLET_MODES.SPEND && Object.keys(signatureImporters).length !== requiredSigners) {
      setRequiredSigners(requiredSigners); // this will generate signature importers
    }
    setMode(mode);
  }
}

function mapStateToProps(state) {
  return {
    ...state.wallet,
    ...state.wallet.common,
    requiredSigners: state.spend.transaction.requiredSigners,
    signatureImporters: state.spend.signatureImporters,
  };
}

const mapDispatchToProps = {
  setMode: setWalletModeAction,
  setRequiredSigners,
  initialLoadComplete,
};

export default connect(mapStateToProps, mapDispatchToProps)(WalletControl);
