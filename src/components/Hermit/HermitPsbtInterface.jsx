import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Components
import { Box, Button, FormHelperText, Grid } from "@mui/material";
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
  importHermitPSBT as importHermitPSBTAction,
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
import HermitSignatureImporterPsbt from "./HermitSignatureImporterPsbt";

// eslint-disable-next-line react/prefer-stateless-function
class HermitPsbtInterface extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      importPSBTDisabled: false,
      importPSBTError: "",
    };
  }

  setPSBTToggleAndError = (importPSBTDisabled, errorMessage) => {
    this.setState({
      importPSBTDisabled,
      importPSBTError: errorMessage,
    });
  };

  render = () => {
    return (
      <Box mt={2}>
        <Grid container spacing={3}>
          <Grid item md={8}>
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
    const { unsignedPSBT } = this.props;
    const { importPSBTDisabled, importPSBTError } = this.state;
    return (
      <Box>
        {!unsignedPSBT && (
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
        )}

        {unsignedPSBT && (
          <Box mt={2}>
            <HermitSignatureImporterPsbt unsignedPsbt={unsignedPSBT} />
          </Box>
        )}
      </Box>
    );
  };

  handleImportPSBT = ({ target }) => {
    const { importHermitPSBT } = this.props;

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
          importHermitPSBT(psbtText);
          this.setPSBTToggleAndError(false, "");
        } catch (e) {
          this.setPSBTToggleAndError(false, e.message);
        }
      };
      fileReader.readAsText(target.files[0]);
    } catch (e) {
      this.setPSBTToggleAndError(false, e.message);
    }
  };
}

HermitPsbtInterface.propTypes = {
  importHermitPSBT: PropTypes.func.isRequired,
  unsignedPSBT: PropTypes.string.isRequired,
};

function mapStateToProps(state) {
  return {
    unsignedPSBT: state.spend.transaction.unsignedPSBT,
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
  importHermitPSBT: importHermitPSBTAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HermitPsbtInterface);
