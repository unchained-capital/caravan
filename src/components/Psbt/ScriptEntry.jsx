import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  P2SH,
  P2SH_P2WSH,
  P2WSH,
  generateMultisigFromHex,
  validateHex,
  multisigRequiredSigners,
  multisigTotalSigners,
  // eslint-disable-next-line no-unused-vars
  MAINNET,
  TESTNET,
  satoshisToBitcoins,
} from "unchained-bitcoin";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Button,
  TextField,
  FormHelperText,
} from "@material-ui/core";
import BigNumber from "bignumber.js";
import { fetchAddressUTXOs } from "../../blockchain";

// Components
import MultisigDetails from "../MultisigDetails";
import ImportAddressesButton from "../ImportAddressesButton";

// Actions
import {
  setFrozen as setFrozenAction,
  setNetwork as setNetworkAction,
} from "../../actions/settingsActions";
import {
  choosePerformSpend as chosePerformSpendAction,
  setRequiredSigners as setRequiredSignersAction,
  setTotalSigners as setTotalSignersAction,
  setInputs as setInputsAction,
  importLegacyPSBT as importPSBTAction,
  setOutputAddress as setOutputAddressAction,
  setOutputAmount as setOutputAmountAction,
  setFee as setFeeAction,
  finalizeOutputs as finalizeOutputsAction,
  setUnsignedPSBT as setUnsignedPSBTAction,
} from "../../actions/transactionActions";
import {
  chooseConfirmOwnership as chooseConfirmOwnershipAction,
  setOwnershipMultisig as setOwnershipMultisigAction,
} from "../../actions/ownershipActions";

class ScriptEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scriptHex: "",
      scriptError: "",
      fetchUTXOsError: "",
      fetchedUTXOs: false,
      importPSBTDisabled: false,
      importPSBTError: "",
    };
  }

  disabled = () => {};

  hasScriptError = () => {
    const { scriptError } = this.state;
    return scriptError !== "";
  };

  hasFetchUTXOsError = () => {
    const { fetchUTXOsError } = this.state;
    return fetchUTXOsError !== "";
  };

  hasError = () => this.hasScriptError() || this.hasFetchUTXOsError();

  //
  // Script
  //

  scriptName = () => {
    const { addressType } = this.props;
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
  };

  scriptTitle = () => {
    const scriptName = this.scriptName();
    return scriptName.charAt(0).toUpperCase() + scriptName.substring(1);
  };

  handleScriptChange = (redeemScriptHex) => {
    const scriptHex = redeemScriptHex;
    let scriptError = "";

    if (scriptHex === "") {
      scriptError = `${this.scriptTitle()} script cannot be blank.`;
    }

    if (
      scriptError === "" &&
      (scriptHex.includes("\n") ||
        scriptHex.includes("\t") ||
        scriptHex.includes(" "))
    ) {
      scriptError = `${this.scriptTitle()} script should not contain spaces, tabs, or newlines.`;
    }

    if (scriptError === "") {
      const hexError = validateHex(scriptHex);
      if (hexError !== "") {
        scriptError = `${this.scriptTitle()} script is not valid hex.`;
      }
    }

    if (scriptHex !== "" && scriptError === "") {
      try {
        this.generateMultisig(scriptHex);
      } catch (parseError) {
        // eslint-disable-next-line no-console
        console.error(parseError);
        scriptError = `Failed to parse ${this.scriptName()} script.`;
      }
    }

    this.setState({
      scriptHex,
      scriptError,
      fetchUTXOsError: "",
      fetchedUTXOs: false,
    });
  };

  generateMultisig = (newScriptHex) => {
    const { network, addressType } = this.props;
    const { scriptHex } = this.state;
    let multisigScriptHex = scriptHex;
    if (newScriptHex) multisigScriptHex = newScriptHex;

    return generateMultisigFromHex(network, addressType, multisigScriptHex);
  };

  //
  // Details
  //

  renderDetails = () => {
    const { fetchUTXOsError } = this.state;
    const { chosePerformSpend, choseConfirmOwnership, client } = this.props;
    const multisig = this.generateMultisig();
    const buttonsDisabled = chosePerformSpend || choseConfirmOwnership;
    return (
      <div>
        <MultisigDetails multisig={multisig} />
        <Box mt={2}>
          <Grid container spacing={3}>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={this.performSpend}
                disabled={buttonsDisabled}
              >
                Spend from this address
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                size="large"
                onClick={this.confirmOwnership}
                disabled={buttonsDisabled}
              >
                Confirm ownership
              </Button>
            </Grid>
          </Grid>
          <FormHelperText error>{fetchUTXOsError}</FormHelperText>
        </Box>
        {client.type === "private" && (
          <Box mt={2}>
            <ImportAddressesButton
              addresses={[multisig.address]}
              client={client}
            />
          </Box>
        )}
      </div>
    );
  };

  //
  // Perform Spend
  //

  performSpend = async () => {
    const {
      setRequiredSigners,
      setTotalSigners,
      setInputs,
      setFrozen,
      choosePerformSpend,
    } = this.props;
    const multisig = this.generateMultisig();
    const fetchUTXOsResult = await this.fetchUTXOs(multisig);
    if (fetchUTXOsResult) {
      const { utxos, balanceSats } = fetchUTXOsResult;
      let fetchUTXOsError = "";
      if (balanceSats.isLessThanOrEqualTo(0)) {
        fetchUTXOsError = "This address has a zero balance.";
      }
      this.setState({
        fetchedUTXOs: true,
        fetchUTXOsError,
      });
      if (fetchUTXOsError === "") {
        // transaction methods expect inputs to have a multisig prop
        // that provides input info such as address
        const inputs = utxos.map((utxo) => {
          const input = { ...utxo, multisig };
          return input;
        });
        setInputs(inputs);
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
  };

  fetchUTXOs = async (multisig) => {
    const { network, client } = this.props;
    const addressData = await fetchAddressUTXOs(
      multisig.address,
      network,
      client
    );

    if (addressData && addressData.utxos && addressData.utxos.length)
      return addressData;

    return false;
  };

  setPSBTToggleAndError = (importPSBTDisabled, errorMessage) => {
    this.setState({
      importPSBTDisabled,
      importPSBTError: errorMessage,
    });
  };

  handleImportPSBT = ({ target }) => {
    const {
      importLegacyPSBT,
      setNetwork,
      setAddress,
      setAmount,
      setFee,
      finalizeOutputs,
      setUnsignedPSBT,
      setPathToSign,
    } = this.props;

    this.setPSBTToggleAndError(true, "");

    try {
      if (target.files.length === 0) {
        this.setPSBTToggleAndError(false, "No PSBT provided.");
        return;
      }
      if (target.files.length > 1) {
        this.setPSBTToggleAndError(false, "Multiple PSBTs provided.");
        return;
      }

      const fileReader = new FileReader();
      fileReader.onload = (event) => {
        try {
          const psbtText = event.target.result;
          const psbt = importLegacyPSBT(psbtText);

          setUnsignedPSBT(psbt.toBase64());
          const { bip32Derivation } = psbt.data.inputs[0];
          const hermitBip32Path = bip32Derivation.find(
            (el) => !el.path.includes("0/0/0")
          ).path;
          setPathToSign(hermitBip32Path);

          const redeemScriptHex = psbt.data.inputs[0].redeemScript.toString(
            "hex"
          );
          this.setPSBTToggleAndError(false, "");

          this.handleScriptChange(redeemScriptHex);
          // set network type
          setNetwork(TESTNET);
          // set inputs (?)
          // set outputs
          this.renderDetails();
          this.performSpend().then(() => {
            const output = psbt.txOutputs[0];
            const outputsTotalSats = new BigNumber(output.value);
            // setNetwork(psbt.opts.network); -- BUGFIX needed on buidl psbt builder
            // setAddress(1, output.address);
            setAmount(1, satoshisToBitcoins(output.value).toFixed(8));
            setAddress(1, "2N2eNFj4PR9as3VH68VtVxJSS1QPT2xQMrr");
            const inputsTotalSats = new BigNumber(10000000);
            const feeSats = inputsTotalSats - outputsTotalSats;
            const fee = satoshisToBitcoins(feeSats).toFixed(8).toString();
            setFee(fee);
            finalizeOutputs(true);
          });
        } catch (e) {
          this.setPSBTToggleAndError(false, e.message);
        }
      };
      fileReader.readAsText(target.files[0]);
    } catch (e) {
      this.setPSBTToggleAndError(false, e.message);
    }
  };

  //
  // Render
  //
  render() {
    const {
      scriptHex,
      scriptError,
      fetchedUTXOs,
      importPSBTDisabled,
      importPSBTError,
    } = this.state;

    return (
      <Card>
        <CardHeader title="Upload unsigned PSBT" />
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
              disabled={fetchedUTXOs && !this.hasFetchUTXOsError()}
              helperText={scriptError}
              error={scriptError !== ""}
            />
          </form>

          <Box mt={2}>
            <label htmlFor="import-psbt">
              <input
                style={{ display: "none" }}
                id="import-psbt"
                name="import-psbt"
                accept="application/base64"
                onChange={this.handleImportPSBT}
                type="file"
              />

              <Button
                color="primary"
                variant="contained"
                component="span"
                disabled={importPSBTDisabled}
                style={{ marginTop: "2em" }}
              >
                Import PSBT
              </Button>
              <FormHelperText error>{importPSBTError}</FormHelperText>
            </label>
          </Box>

          {scriptHex !== "" && !this.hasScriptError() ? (
            this.renderDetails()
          ) : (
            <p>
              Enter a valid {this.scriptName()} script to generate an address to
              spend funds from.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }
}

ScriptEntry.propTypes = {
  addressType: PropTypes.string.isRequired,
  choosePerformSpend: PropTypes.func.isRequired,
  chosePerformSpend: PropTypes.bool.isRequired,
  choseConfirmOwnership: PropTypes.bool.isRequired,
  client: PropTypes.shape({
    type: PropTypes.string,
  }).isRequired,
  network: PropTypes.string.isRequired,
  setFrozen: PropTypes.func.isRequired,
  setNetwork: PropTypes.func.isRequired,
  setInputs: PropTypes.func.isRequired,
  setRequiredSigners: PropTypes.func.isRequired,
  setTotalSigners: PropTypes.func.isRequired,
  setAddress: PropTypes.func.isRequired,
  setAmount: PropTypes.func.isRequired,
  setFee: PropTypes.func.isRequired,
  finalizeOutputs: PropTypes.func.isRequired,
  importLegacyPSBT: PropTypes.func.isRequired,
  setUnsignedPSBT: PropTypes.func.isRequired,
  setPathToSign: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    ...state.settings,
    ...{ client: state.client },
    ...{
      choseConfirmOwnership: state.spend.ownership.chosen,
      chosePerformSpend: state.spend.transaction.chosen,
    },
  };
}

const mapDispatchToProps = {
  choosePerformSpend: chosePerformSpendAction,
  setInputs: setInputsAction,
  setTotalSigners: setTotalSignersAction,
  setRequiredSigners: setRequiredSignersAction,
  chooseConfirmOwnership: chooseConfirmOwnershipAction,
  setOwnershipMultisig: setOwnershipMultisigAction,
  setFrozen: setFrozenAction,
  importLegacyPSBT: importPSBTAction,
  setNetwork: setNetworkAction,
  setAddress: setOutputAddressAction,
  setAmount: setOutputAmountAction,
  setFee: setFeeAction,
  setUnsignedPSBT: setUnsignedPSBTAction,
  finalizeOutputs: finalizeOutputsAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(ScriptEntry);
