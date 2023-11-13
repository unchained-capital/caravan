import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Components
import { Grid, Box, Card, CardContent, Typography } from "@mui/material";
import NetworkPicker from "../NetworkPicker";
import ClientPicker from "../ClientPicker";
import AddressTypePicker from "../AddressTypePicker";
import ScriptEntry from "./ScriptEntry";
import UTXOSet from "./UTXOSet";
import OutputsForm from "./OutputsForm";
import SignatureImporter from "./SignatureImporter";
import Transaction from "./Transaction";
import ConfirmOwnership from "./ConfirmOwnership";
import UnsignedTransaction from "../UnsignedTransaction";
import "../styles.css";

class Spend extends React.Component {
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
    const { transaction, ownership } = this.props;
    if (ownership.chosen) {
      return (
        <Box mt={2}>
          <ConfirmOwnership />
        </Box>
      );
    }
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
      signatureImporters.push(
        <Box key={signatureImporterNum} mt={2}>
          <SignatureImporter
            number={signatureImporterNum}
            unsignedPsbt={transaction.unsignedPSBT}
          />
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

  confirmOwnership = (value) => {
    // TODO can this entire function be removed? The states aren't being used.
    this.setState({ addressFinalized: true, confirmOwnership: value });
  };
}

Spend.propTypes = {
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
    ...state.spend,
  };
}

export default connect(mapStateToProps)(Spend);
