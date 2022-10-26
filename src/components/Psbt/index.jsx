import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Components
import { Box, Card, CardContent, Grid, Typography } from "@material-ui/core";
import "../styles.css";
import {
  autoSelectCoins as autoSelectCoinsAction,
  resetNodesSpend as resetNodesSpendAction,
  updateChangeSliceAction,
  updateDepositSliceAction,
} from "../../actions/walletActions";
import {
  addOutput,
  deleteChangeOutput as deleteChangeOutputAction,
  finalizeOutputs as finalizeOutputsAction,
  importPSBT as importPSBTAction,
  setChangeAddressAction,
  setFeeRate as setFeeRateAction,
  setInputs as setInputsAction,
  setOutputAddress,
  setSpendStep as setSpendStepAction,
  updateAutoSpendAction,
} from "../../actions/transactionActions";
import AddressTypePicker from "../AddressTypePicker";
import NetworkPicker from "../NetworkPicker";
import ClientPicker from "../ClientPicker";
import ScriptEntry from "./ScriptEntry";
import UTXOSet from "./UTXOSet";
import OutputsForm from "./OutputsForm";
import UnsignedTransaction from "../UnsignedTransaction";
import Transaction from "./Transaction";
import SignatureImporter from "./SignatureImporter";

// eslint-disable-next-line react/prefer-stateless-function
class PsbtSpend extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pathToSign: "",
    };
  }

  setPathToSign = (pathToSign) => {
    this.setState({ pathToSign });
  };

  render = () => {
    return (
      <Box mt={2}>
        <Grid container spacing={3}>
          <Grid item md={8}>
            <Box>
              <ScriptEntry setPathToSign={this.setPathToSign} />
            </Box>
            {this.renderBody()}
          </Grid>
          <Grid item md={4}>
            <Box>
              <AddressTypePicker />
            </Box>
            <Box mt={2}>
              <NetworkPicker />
            </Box>
            <Box mt={2}>
              <ClientPicker />
            </Box>
          </Grid>
        </Grid>
      </Box>
    );
  };

  renderBody = () => {
    const { transaction } = this.props;
    return (
      <Box>
        {this.spendable() && (
          <Box>
            <Box mt={2}>
              <Card>
                <CardContent>
                  <UTXOSet
                    inputs={transaction.inputs}
                    inputsTotalSats={transaction.inputsTotalSats}
                  />
                </CardContent>
              </Card>
            </Box>
            <Box mt={2}>
              <Card>
                <CardContent>
                  <Typography variant="h5">Define Outputs</Typography>
                  <OutputsForm />
                </CardContent>
              </Card>
            </Box>
          </Box>
        )}

        {transaction.finalizedOutputs && (
          <div>
            <Box mt={2}>
              <UnsignedTransaction />
            </Box>

            <Box mt={2}>{this.renderSignatureImporters()}</Box>
          </div>
        )}

        {this.signaturesFinalized() && (
          <Box mt={2}>
            <Transaction />
          </Box>
        )}
      </Box>
    );
  };

  renderSignatureImporters = () => {
    const { transaction } = this.props;
    const { pathToSign } = this.state;
    const signatureImporters = [];

    signatureImporters.push(
      <Box key={1} mt={2}>
        <SignatureImporter
          number={1}
          selected="hermit"
          unsignedPsbt={transaction.unsignedPSBT}
          bip32Path={pathToSign}
        />
      </Box>
    );
    for (
      let signatureImporterNum = 2;
      signatureImporterNum <= transaction.requiredSigners;
      signatureImporterNum += 1
    ) {
      signatureImporters.push(
        <Box key={signatureImporterNum} mt={2}>
          <SignatureImporter number={signatureImporterNum} />
        </Box>
      );
    }
    return signatureImporters;
  };

  spendable = () => {
    const { transaction } = this.props;
    return transaction.inputs.length > 0;
  };

  signaturesFinalized = () => {
    const { signatureImporters } = this.props;
    return (
      Object.values(signatureImporters).length > 0 &&
      Object.values(signatureImporters).every(
        (signatureImporter) => signatureImporter.finalized
      )
    );
  };
}

PsbtSpend.propTypes = {
  transaction: PropTypes.shape({
    finalizedOutputs: PropTypes.bool,
    inputs: PropTypes.arrayOf(PropTypes.shape({})),
    inputsTotalSats: PropTypes.shape({}),
    requiredSigners: PropTypes.number,
    unsignedPSBT: PropTypes.string,
  }).isRequired,
  ownership: PropTypes.shape({
    chosen: PropTypes.bool,
  }).isRequired,
  signatureImporters: PropTypes.shape({}).isRequired,
};

function mapStateToProps(state) {
  return {
    transaction: state.spend.transaction,
    signatureImporters: state.spend.signatureImporters,
    fee: state.fee,
  };
}

const mapDispatchToProps = {
  autoSelectCoins: autoSelectCoinsAction,
  deleteChangeOutput: deleteChangeOutputAction,
  updateAutoSpend: updateAutoSpendAction,
  setInputs: setInputsAction,
  updateChangeSlice: updateChangeSliceAction,
  updateDepositSlice: updateDepositSliceAction,
  setAddress: setOutputAddress,
  resetNodesSpend: resetNodesSpendAction,
  setFeeRate: setFeeRateAction,
  addOutput,
  finalizeOutputs: finalizeOutputsAction,
  setChangeAddress: setChangeAddressAction,
  setSpendStep: setSpendStepAction,
  importPSBT: importPSBTAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(PsbtSpend);
