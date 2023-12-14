import React from "react";
import PropTypes from "prop-types";
import {
  PENDING,
  UNSUPPORTED,
  SignMultisigTransaction,
  ACTIVE,
} from "unchained-wallets";
import {
  Box,
  FormHelperText,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  FormGroup,
} from "@mui/material";
import { satoshisToBitcoins } from "unchained-bitcoin";
import InteractionMessages from "../InteractionMessages";

class IndirectSignatureImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bip32PathError: "",
      signatureError: "",
      status: this.interaction().isSupported() ? PENDING : UNSUPPORTED,
    };
  }

  interaction = () => {
    const { signatureImporter, network, inputs, outputs } = this.props;
    const keystore = signatureImporter.method;
    const bip32Paths = inputs.map((input) => {
      if (typeof input.bip32Path === "undefined")
        return signatureImporter.bip32Path; // pubkey path
      return `${signatureImporter.bip32Path}${input.bip32Path.slice(1)}`; // xpub/pubkey slice away the m, keep /
    });

    return SignMultisigTransaction({
      keystore,
      network,
      inputs,
      outputs,
      bip32Paths,
    });
  };

  renderDeviceConfirmInfo = () => {
    const { fee, inputsTotalSats } = this.props;
    return (
      <Box>
        <p>Your device will ask you to verify the following information:</p>
        <Table>
          <TableHead>
            <TableRow hover>
              <TableCell />
              <TableCell>Amount (BTC)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {this.renderTargets()}
            <TableRow hover>
              <TableCell>Fee</TableCell>
              <TableCell>{fee}</TableCell>
            </TableRow>
            <TableRow hover>
              <TableCell>Total</TableCell>
              <TableCell>{satoshisToBitcoins(inputsTotalSats)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>
    );
  };

  renderTargets = () => {
    const { outputs } = this.props;
    return outputs.map((output) => {
      return (
        <TableRow hover key={output.address}>
          <TableCell>
            Address <code>{output.address}</code>
          </TableCell>
          <TableCell>{output.amount}</TableCell>
        </TableRow>
      );
    });
  };

  render = () => {
    const { disableChangeMethod, extendedPublicKeyImporter, Signer } =
      this.props;
    const { signatureError, status } = this.state;
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
          {this.renderDeviceConfirmInfo()}
          <FormGroup>
            <Signer
              setError={this.setError}
              hasError={this.hasBIP32PathError()}
              onReceive={this.onReceive}
              onReceivePSBT={this.onReceivePSBT}
              interaction={this.interaction()}
              setActive={this.setActive}
              disableChangeMethod={disableChangeMethod}
              extendedPublicKeyImporter={extendedPublicKeyImporter}
            />

            <FormHelperText error>{signatureError}</FormHelperText>

            <InteractionMessages
              messages={interaction.messagesFor({ state: status })}
            />
          </FormGroup>
        </Box>
      </Box>
    );
  };

  setActive = () => {
    this.setState({ status: ACTIVE });
  };

  onReceive = (signature) => {
    const { validateAndSetSignature, enableChangeMethod } = this.props;
    this.setState({ signatureError: "" });
    if (enableChangeMethod) {
      enableChangeMethod();
    }
    validateAndSetSignature(signature, (signatureError) => {
      this.setState({ signatureError });
    });
  };

  onReceivePSBT = (data) => {
    const { validateAndSetSignature } = this.props;
    try {
      // signatureData is one or more sets of signatures that are keyed
      // based on which pubkey the signatures are signing.
      const signatureData = this.interaction().parse(data);
      const signatureSetsKeys = Object.keys(signatureData);
      const signatures = [];

      // We have a slight issue for the n-ly signed PSBT case
      // because there is no order to the pubkey: [signature(s)] mapping
      // returned from `unchained-bitcoin`. it's ok, we have valid signatures, etc.
      // but truncating information can cause problems down the line in keeping
      // the validation straightforward.

      // e.g. have a doubly-signed psbt with 3 inputs on the same 2-of-3 multisig address,
      // so 6 signatures total are returned in signatureData back for 2 pubkeys (3 signatures from each pubkey).
      // here adding a pubkey set matches that signature array.
      // [siga1, siga2, siga3, sigb1, sigb2, sigb3]
      // In the case of multiple 2-of-3 multisig addresses, the pubkeys can get jumbled and there's no longer
      // a clear break between signature sets based purely on pubkey. need xfp information as well.

      // For now, shove all of the signatures into the same array and return that.
      signatureSetsKeys.forEach((pubkey) => {
        signatures.push(...signatureData[pubkey]);
      });

      this.setState({ signatureError: "" });
      validateAndSetSignature(signatures, (signatureError) => {
        this.setState({ signatureError });
      });
    } catch (e) {
      e.errorType = "Coldcard Signing Error";
      this.setState({ signatureError: e.message });
    }
  };

  setError = (value) => {
    this.setState({ signatureError: value });
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

IndirectSignatureImporter.propTypes = {
  network: PropTypes.string.isRequired,
  inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  outputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  signatureImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
    method: PropTypes.string,
  }).isRequired,
  resetBIP32Path: PropTypes.func,
  defaultBIP32Path: PropTypes.string,
  validateAndSetBIP32Path: PropTypes.func,
  validateAndSetSignature: PropTypes.func.isRequired,
  enableChangeMethod: PropTypes.func,
  disableChangeMethod: PropTypes.func,
  extendedPublicKeyImporter: PropTypes.shape({
    method: PropTypes.string,
  }),
  Signer: PropTypes.shape({}).isRequired,
  fee: PropTypes.string,
  inputsTotalSats: PropTypes.shape({}),
};

IndirectSignatureImporter.defaultProps = {
  resetBIP32Path: null,
  defaultBIP32Path: "",
  validateAndSetBIP32Path: null,
  enableChangeMethod: null,
  disableChangeMethod: null,
  extendedPublicKeyImporter: {},
  fee: "",
  inputsTotalSats: {},
};

export default IndirectSignatureImporter;
