import React from "react";
import PropTypes from "prop-types";
import { unsignedMultisigPSBT } from "unchained-bitcoin";
import {
  HERMIT,
  PENDING,
  UNSUPPORTED,
  SignMultisigTransaction,
} from "unchained-wallets";
import {
  Grid,
  Box,
  TextField,
  Button,
  FormHelperText,
} from "@material-ui/core";
import HermitReader from "./HermitReader";
import HermitDisplayer from "./HermitDisplayer";
import InteractionMessages from "../InteractionMessages";

class HermitSignatureImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bip32PathError: "",
      signatureError: "",
      status: this.interaction(true).isSupported() ? PENDING : UNSUPPORTED,
    };
  }

  interaction = () => {
    const { signatureImporter, network, inputs, outputs } = this.props;
    // const bip32Paths = inputs.map((input) => {
    //   if (typeof input.bip32Path === "undefined")
    //     return signatureImporter.bip32Path; // pubkey path
    //   return `${signatureImporter.bip32Path}${input.bip32Path.slice(1)}`; // xpub/pubkey slice away the m, keep /
    // });

    const psbtBase64 = unsignedMultisigPSBT(
      network,
      inputs,
      outputs,
      true
    ).toBase64();

    return SignMultisigTransaction({
      keystore: HERMIT,
      network,
      psbt: psbtBase64,
      keyDetails: {
        path: signatureImporter.bip32Path,
        xfp: "", // FIXME
      },
    });
  };

  render = () => {
    const {
      signatureImporter,
      disableChangeMethod,
      resetBIP32Path,
    } = this.props;
    const { bip32PathError, signatureError, status } = this.state;
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
        <Grid container>
          <Grid item md={10}>
            <TextField
              name="bip32Path"
              value={signatureImporter.bip32Path}
              onChange={this.handleBIP32PathChange}
              disabled={status !== PENDING}
              error={this.hasBIP32PathError()}
              helperText={bip32PathError}
            />
          </Grid>

          <Grid item md={2}>
            {!this.bip32PathIsDefault() && (
              <Button
                type="button"
                variant="contained"
                size="small"
                onClick={resetBIP32Path}
                disabled={status !== PENDING}
              >
                Default
              </Button>
            )}
          </Grid>
        </Grid>

        <FormHelperText>
          Use the default value if you don&rsquo;t understand BIP32 paths.
        </FormHelperText>

        <Box mt={2}>
          <Grid container justify="center">
            <Grid item>
              <HermitDisplayer width={400} parts={interaction.request()} />
            </Grid>
          </Grid>

          <HermitReader
            startText="Scan Signature QR Code"
            interaction={interaction}
            onStart={disableChangeMethod}
            onSuccess={this.import}
            onClear={this.clear}
          />

          <InteractionMessages
            messages={interaction.messagesFor({ state: status })}
            excludeCodes={["hermit.signature_request", "hermit.command"]}
          />

          <FormHelperText error>{signatureError}</FormHelperText>
        </Box>
      </Box>
    );
  };

  import = (signature) => {
    const { validateAndSetSignature, enableChangeMethod } = this.props;
    this.setState({ signatureError: "" });
    enableChangeMethod();
    validateAndSetSignature(
      this.interaction().parse(signature),
      (signatureError) => {
        this.setState({ signatureError });
      }
    );
  };

  clear = () => {
    const { resetBIP32Path, enableChangeMethod } = this.props;
    resetBIP32Path();
    this.setState({ signatureError: "" });
    enableChangeMethod();
  };

  hasBIP32PathError = () => {
    const { bip32PathError } = this.state;
    return bip32PathError !== "";
  };

  handleBIP32PathChange = (event) => {
    const { validateAndSetBIP32Path } = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(
      bip32Path,
      () => {},
      (bip32PathError) => {
        this.setState({ bip32PathError });
      }
    );
  };

  bip32PathIsDefault = () => {
    const { signatureImporter, defaultBIP32Path } = this.props;
    return signatureImporter.bip32Path === defaultBIP32Path;
  };
}

HermitSignatureImporter.propTypes = {
  network: PropTypes.string.isRequired,
  inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  outputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  signatureImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
  }).isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetSignature: PropTypes.func.isRequired,
  enableChangeMethod: PropTypes.func.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
};

export default HermitSignatureImporter;
