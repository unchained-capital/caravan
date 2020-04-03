import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  P2SH,
  P2SH_P2WSH,
  P2WSH,
  generateMultisigFromHex,
  validateHex,
  multisigRequiredSigners,
  multisigTotalSigners,
} from 'unchained-bitcoin';
import { fetchAddressUTXOs } from '../../blockchain';

// Components
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  FormHelperText,
} from '@material-ui/core';
import MultisigDetails from "../MultisigDetails";
import BitcoindAddressImporter from "../BitcoindAddressImporter";

// Actions
import {
  setFrozen,
} from '../../actions/settingsActions';
import {
  choosePerformSpend,
  setRequiredSigners,
  setTotalSigners,
  setInputs,
} from '../../actions/transactionActions';
import {
  chooseConfirmOwnership,
  setOwnershipMultisig,
} from "../../actions/ownershipActions";

class ScriptEntry extends React.Component {

  static propTypes = {
    network: PropTypes.string.isRequired,
    client: PropTypes.object.isRequired,
    setFrozen: PropTypes.func.isRequired,
    setRequiredSigners: PropTypes.func.isRequired,
    setTotalSigners: PropTypes.func.isRequired,
    setInputs: PropTypes.func.isRequired,
    addressType: PropTypes.string.isRequired,
    setOwnershipMultisig: PropTypes.func.isRequired,
    chosePerformSpend: PropTypes.bool.isRequired,
    choseConfirmOwnership: PropTypes.bool.isRequired,
  };

  state = {
    scriptHex: '',
    scriptError: '',
    fetchUTXOsError: '',
    fetchedUTXOs: false,
  };

  disabled = () => {

  }

  render() {
    const { scriptHex, scriptError, fetchedUTXOs } = this.state;

    return (
      <Card>
        <CardHeader title={`Enter ${this.scriptTitle()} Script`} />
        <CardContent>
          <form>
            <TextField
              fullWidth
              multiline
              autoFocus
              variant="outlined"
              label={`${this.scriptTitle()} Script`}
              value={scriptHex}
              rows={5}
              onChange={this.handleScriptChange}
              disabled={fetchedUTXOs && (! this.hasFetchUTXOsError())}
              helperText={scriptError}
              error={scriptError!==''}
            />
          </form>

          {(scriptHex !== '' && !this.hasScriptError())
           ?
           this.renderDetails()
           :
           <p>Enter a valid {this.scriptName()} script to generate an address to spend funds from.</p>}


        </CardContent>

      </Card>
    );
  }

  hasScriptError = () => (this.state.scriptError !== '')
  hasFetchUTXOsError = () => (this.state.fetchUTXOsError !== '')
  hasError = () => (this.hasScriptError() || this.hasFetchUTXOsError())

  //
  // Script
  //

  scriptName = () => {
    const {addressType} = this.props;
    switch (addressType) {
    case P2SH:
      return "redeem";
    case P2SH_P2WSH:
      return "witness";
    case P2WSH:
      return "witness";
    default:
      return null;
    }
  }

  scriptTitle = () => {
    const scriptName = this.scriptName();
    return scriptName.charAt(0).toUpperCase() + scriptName.substring(1);
  }

  handleScriptChange = (event) => {
    const scriptHex = event.target.value;
    let scriptError = '';

    if (scriptHex === '') {
      scriptError = `${this.scriptTitle()} script cannot be blank.`;
    }

    if (scriptError === '' && (scriptHex.includes('\n') || scriptHex.includes('\t') || scriptHex.includes(' '))) {
      scriptError = `${this.scriptTitle()} script should not contain spaces, tabs, or newlines.`;
    }

    if (scriptError === '') {
      const hexError = validateHex(scriptHex);
      if (hexError !== '') {
        scriptError = `${this.scriptTitle()} script is not valid hex.`;
      }
    }

    if (scriptHex !== '' && scriptError === '') {
      try {
        this.generateMultisig(scriptHex);
      } catch (parseError) {
        console.error(parseError);
        scriptError = `Failed to parse ${this.scriptName()} script.`;
      }
    }

    this.setState({
      scriptHex,
      scriptError,
      fetchUTXOsError: '',
      fetchedUTXOs: false,
    });
  };

  generateMultisig = (scriptHex) => {
    const {network, addressType} = this.props;
    if (! scriptHex) {
      scriptHex = this.state.scriptHex;
    }
    return generateMultisigFromHex(network, addressType, scriptHex);
  }

  //
  // Details
  //

  renderDetails = () => {
    const { fetchUTXOsError } = this.state;
    const { chosePerformSpend, choseConfirmOwnership, client } = this.props;
    const multisig = this.generateMultisig();
    const buttonsDisabled = (chosePerformSpend || choseConfirmOwnership);
    return (
      <div>
        <MultisigDetails multisig={multisig} />
        <Box mt={2}>
          <Grid container spacing={3}>
            <Grid item>
              <Button variant="contained" color="primary" size="large" onClick={this.performSpend} disabled={buttonsDisabled}>
                Spend from this address
              </Button>
            </Grid>
            <Grid item>
              <Button variant="contained" size="large" onClick={this.confirmOwnership} disabled={buttonsDisabled}>
                Confirm ownership
              </Button>
            </Grid>
          </Grid>
          <FormHelperText error>{fetchUTXOsError}</FormHelperText>
        </Box>
        {
          client.type === "private" &&
          <Box mt={2}>
            <BitcoindAddressImporter addresses={[multisig.address]} />
          </Box>
        }
      </div>
    );
  }

  //
  // Perform Spend
  //

  performSpend = async () => {
    const {setRequiredSigners, setTotalSigners, setInputs, setFrozen, choosePerformSpend} = this.props;
    const multisig = this.generateMultisig();
    const fetchUTXOsResult = await this.fetchUTXOs(multisig);
    if (fetchUTXOsResult) {
      const {utxos, balanceSats} = fetchUTXOsResult;
      let fetchUTXOsError = '';
      if (balanceSats.isLessThanOrEqualTo(0)) {
        fetchUTXOsError = "This address has a zero balance.";
      }
      this.setState({
        fetchedUTXOs: true,
        fetchUTXOsError,
      });
      if (fetchUTXOsError === '') {
        setInputs(utxos);
        setRequiredSigners(multisigRequiredSigners(multisig));
        setTotalSigners(multisigTotalSigners(multisig));
        setFrozen(true);
        choosePerformSpend();
      }
    } else {
      this.setState({
        fetchedUTXOs: false,
        fetchUTXOsError: "Failed to fetch UTXOs.",
      });
    }
  }

  fetchUTXOs = async (multisig) => {
    const {network, client} = this.props;
    let addressData = 
      await fetchAddressUTXOs(multisig.address, network, client);

    if (addressData && addressData.utxos && addressData.utxos.length) 
      return addressData
    
    return false;
  }

  //
  // Confirm Ownership
  //

  confirmOwnership = () => {
    const {chooseConfirmOwnership, setOwnershipMultisig, setFrozen} = this.props;
    setOwnershipMultisig(this.generateMultisig());
    chooseConfirmOwnership();
    setFrozen(true);
  }
}

function mapStateToProps(state) {
  return {
    ...state.settings,
    ...{client: state.client},
    ...{
      choseConfirmOwnership: state.spend.ownership.chosen,
      chosePerformSpend: state.spend.transaction.chosen,
    }
  };
}

const mapDispatchToProps = {
  choosePerformSpend,
  setFrozen,
  setInputs,
  setTotalSigners,
  setRequiredSigners,
  chooseConfirmOwnership,
  setOwnershipMultisig,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ScriptEntry);
