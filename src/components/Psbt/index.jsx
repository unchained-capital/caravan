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
  render = () => {
    return (
      <Box mt={2}>
        <Grid container spacing={3}>
          <Grid item md={8}>
            <Box>
              <ScriptEntry />
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
    const signatureImporters = [];
    for (
      let signatureImporterNum = 1;
      signatureImporterNum <= transaction.requiredSigners;
      signatureImporterNum += 1
    ) {
      if (signatureImporterNum === 1) {
        signatureImporters.push(
          <Box key={signatureImporterNum} mt={2}>
            <SignatureImporter
              number={signatureImporterNum}
              selected="hermit"
              unsignedPsbt="cHNidP8BAFMBAAAAAQt7WFA3DsW55JqydOdqLh3km1xSNrGtdKr6fymPb9Q7AQAAAAD/////AYGSmAAAAAAAF6kUZxmZd+uSwP7KUXb2vfb55nB8rByHAAAAAE8BBDWHzwO82dPNgAAAAI8WyfxWyqXs45tIXJkOD5NBRvSp+nuwpsL63mbM2OMwA4mYw2VbFuHXT2yrIWUesb5nOUsnJjVqMN9MkhILKHGYEPV+xl0tAACAAQAAgAAAAIBPAQQ1h88D5spSFoAAAAsJm54QQ85zZFWplgjZr0Lttwh4IWPL2W9gSadnAGk60gKiS4xQFbT+BmY+Rmw51JIm7nGUwg9quXUpRP/P2Ey4pxDYTLinAAAAAAAAAAAAAAAATwEENYfPA+bKUhaAAAAMjUSS1GhzE7o98II+nE8d5ArLBL3/zSYBAB6g2Pb6gIsCoU2QRluAZNDZP9YxZ48SIQx6AjpXyIsVc/ry827HHvIQbsce8gAAAAAAAAAAAAAAAAABAPcCAAAAAAEBIgiEcRHvkQeW6lO1HjhsO8z02EJOmyz5RMBi4cXDZgQAAAAAFxYAFOOtZckfCeRZAUhAIDmlYFaCO+uv/v///wLaWm0pAQAAABepFPziXS2G2hM/fSbcziang6mAMdP0h4CWmAAAAAAAF6kUiIk4XtEPw9oQfcSZ7EBsT9ClrWeHAkcwRAIgKD0UuxHvD+PvyrcJmTd6uSuKmAOW/PPc/uGT4WaBQVsCIEp++og4FHTPvp/io99hZod0MNfCB8FMQor+KxMAvRKiASECHIZIZEEWGWkkv3LaGINKAj8ztEBhGxStsj0d1qCpBwSMAAAAAQRpUiEDSBm+qY1wHFrQgu6e6uDCbA4WXcX4eQ5G9Waq6qnKhy4hAkquOPgmEwgjmzv73mWPFS7T+5rzNSdfqpgOWZ9C/kO8IQMNeCfDwt9Q6qCHFNll1VSMOr2E7pBOI/+EUkRZuURXuFOuIgYCSq44+CYTCCObO/veZY8VLtP7mvM1J1+qmA5Zn0L+Q7wYbsce8gAAAAAAAAAAAAAAAAoAAAABAAAAIgYDDXgnw8LfUOqghxTZZdVUjDq9hO6QTiP/hFJEWblEV7gY9X7GXS0AAIABAACAAAAAgAoAAAABAAAAIgYDSBm+qY1wHFrQgu6e6uDCbA4WXcX4eQ5G9Waq6qnKhy4Y2Ey4pwAAAAAAAAAAAAAAAAoAAAABAAAAAAA="
              bip32Path="m/45'/1'/0'/10/1"
            />
          </Box>
        );
      } else {
        signatureImporters.push(
          <Box key={signatureImporterNum} mt={2}>
            <SignatureImporter number={signatureImporterNum} />
          </Box>
        );
      }
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
