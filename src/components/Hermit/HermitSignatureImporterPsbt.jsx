import React from "react";
import PropTypes from "prop-types";
import { parseSignatureArrayFromPSBT } from "unchained-bitcoin";
import {
  HERMIT,
  PENDING,
  UNSUPPORTED,
  SignMultisigTransaction,
} from "unchained-wallets";
import { Grid, Box, Button } from "@mui/material";
import HermitDisplayer from "./HermitDisplayer";
import InteractionMessages from "../InteractionMessages";

class HermitSignatureImporterPsbt extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      status: this.interaction(true).isSupported() ? PENDING : UNSUPPORTED,
      displaySignatureRequest: true,
    };
  }

  interaction = () => {
    const { unsignedPsbt } = this.props;

    return SignMultisigTransaction({
      keystore: HERMIT,
      psbt: unsignedPsbt,
    });
  };

  handleShowSignatureRequest = () => {
    this.setState({ displaySignatureRequest: true });
  };

  handleHideSignatureRequest = () => {
    this.setState({ displaySignatureRequest: false });
  };

  render = () => {
    const { status, displaySignatureRequest } = this.state;
    const interaction = this.interaction();
    if (status === UNSUPPORTED) {
      return (
        <InteractionMessages
          messages={interaction.messagesFor({ state: status })}
          excludeCodes={["hermit.signature_request", "hermit.command"]}
        />
      );
    }
    return (
      <Box mt={2}>
        <Box mt={2}>
          {displaySignatureRequest ? (
            <Grid container justify="center">
              <Grid item>
                <HermitDisplayer
                  width={400}
                  parts={interaction.request()}
                  onCancel={this.handleHideSignatureRequest}
                />
              </Grid>
            </Grid>
          ) : (
            <Button
              variant="contained"
              color="primary"
              className="m-2"
              size="large"
              onClick={this.handleShowSignatureRequest}
            >
              Show Signature Request
            </Button>
          )}
        </Box>
      </Box>
    );
  };

  import = (signature) => {
    const { validateAndSetSignature } = this.props;
    const signedPsbt = this.interaction().parse(signature);
    const signatureArray = parseSignatureArrayFromPSBT(signedPsbt);
    validateAndSetSignature(signatureArray, () => {}, signedPsbt);
  };
}

HermitSignatureImporterPsbt.propTypes = {
  signatureImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
  }).isRequired,
  validateAndSetSignature: PropTypes.func.isRequired,
  unsignedPsbt: PropTypes.string.isRequired,
};

export default HermitSignatureImporterPsbt;
