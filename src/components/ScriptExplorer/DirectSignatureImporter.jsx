import React from "react";
import PropTypes from "prop-types";
import { satoshisToBitcoins } from "unchained-bitcoin";
import {
  PENDING,
  UNSUPPORTED,
  ACTIVE,
  ERROR,
  SignMultisigTransaction,
} from "unchained-wallets";
import {
  Button,
  TextField,
  FormHelperText,
  Box,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@mui/material";
import InteractionMessages from "../InteractionMessages";
import { walletConfigPropType } from "../../proptypes/wallet";

class DirectSignatureImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      signatureError: "",
      bip32PathError: "",
      status: this.interaction().isSupported() ? PENDING : UNSUPPORTED,
    };
  }

  componentDidMount = () => {
    this.resetBIP32Path();
  };

  interaction = () => {
    const {
      signatureImporter,
      network,
      inputs,
      outputs,
      walletConfig,
      extendedPublicKeyImporter,
    } = this.props;
    const keystore = signatureImporter.method;
    const bip32Paths = inputs.map((input) => {
      if (typeof input.bip32Path === "undefined")
        return signatureImporter.bip32Path; // pubkey path
      return `${signatureImporter.bip32Path}${input.bip32Path.slice(1)}`; // xpub/pubkey slice away the m, keep /
    });
    const policyHmac = walletConfig.ledgerPolicyHmacs.find(
      (hmac) => hmac.xfp === extendedPublicKeyImporter.rootXfp
    )?.policyHmac;

    return SignMultisigTransaction({
      network,
      keystore,
      inputs,
      outputs,
      bip32Paths,
      walletConfig,
      policyHmac,
      returnSignatureArray: true,
    });
  };

  render = () => {
    const { signatureImporter, extendedPublicKeyImporter, isWallet } =
      this.props;
    const { status } = this.state;
    const interaction = this.interaction();
    if (status === UNSUPPORTED) {
      return (
        <FormHelperText error>
          {interaction.messageTextFor({ state: status })}
        </FormHelperText>
      );
    }
    return (
      <Box mt={2}>
        {(!isWallet ||
          extendedPublicKeyImporter === null ||
          typeof extendedPublicKeyImporter === "undefined" ||
          extendedPublicKeyImporter.method === "text") && (
          <>
            <Grid container>
              <Grid item md={10}>
                <TextField
                  fullWidth
                  name="bip32Path"
                  label="BIP32 Path"
                  type="text"
                  value={signatureImporter.bip32Path}
                  variant="standard"
                  onChange={this.handleBIP32PathChange}
                  disabled={status !== PENDING}
                  error={this.hasBIP32PathError()}
                  helperText={this.bip32PathError()}
                />
              </Grid>
              <Grid item md={2}>
                {!this.bip32PathIsDefault() && (
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    onClick={this.resetBIP32Path}
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
          </>
        )}
        <Box mt={2}>{this.renderAction()}</Box>
        {this.renderDeviceConfirmInfo()}
        <InteractionMessages
          messages={interaction.messagesFor({ state: status })}
          excludeCodes={["bip32"]}
        />
      </Box>
    );
  };

  renderDeviceConfirmInfo = () => {
    const { fee, inputsTotalSats } = this.props;
    const { status } = this.state;

    if (status === ACTIVE) {
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
    }
    return "";
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

  renderAction = () => {
    const { signatureError, status } = this.state;
    return (
      <Grid container alignItems="center">
        <Grid item md={3}>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={this.sign}
            disabled={status !== PENDING}
          >
            Sign
          </Button>
        </Grid>
        <Grid item md={9}>
          <FormHelperText error>{signatureError}</FormHelperText>
        </Grid>
      </Grid>
    );
  };

  //
  // BIP32 Path
  //

  hasBIP32PathError = () => {
    const { bip32PathError, status } = this.state;
    return (
      bip32PathError !== "" ||
      this.interaction().hasMessagesFor({
        state: status,
        level: ERROR,
        code: "bip32",
      })
    );
  };

  bip32PathError = () => {
    const { bip32PathError, status } = this.state;
    if (bip32PathError !== "") {
      return bip32PathError;
    }
    return this.interaction().messageTextFor({
      state: status,
      level: ERROR,
      code: "bip32",
    });
  };

  setBIP32PathError = (value) => {
    this.setState({ bip32PathError: value });
  };

  handleBIP32PathChange = (event) => {
    const { validateAndSetBIP32Path } = this.props;
    const bip32Path = event.target.value;
    validateAndSetBIP32Path(bip32Path, () => {}, this.setBIP32PathError);
  };

  bip32PathIsDefault = () => {
    const { signatureImporter, defaultBIP32Path } = this.props;
    return signatureImporter.bip32Path === defaultBIP32Path;
  };

  resetBIP32Path = () => {
    const { resetBIP32Path } = this.props;
    this.setBIP32PathError("");
    resetBIP32Path();
  };

  //
  // Sign
  //

  sign = async () => {
    const { disableChangeMethod, validateAndSetSignature, enableChangeMethod } =
      this.props;
    disableChangeMethod();
    this.setState({ signatureError: "", status: ACTIVE });

    try {
      const signature = await this.interaction().run();
      validateAndSetSignature(signature, (signatureError) => {
        const stateUpdate = { signatureError };
        if (signatureError !== "") stateUpdate.status = PENDING;
        this.setState(stateUpdate);
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      this.setState({ signatureError: e.message, status: PENDING });
    }
    enableChangeMethod();
  };
}

DirectSignatureImporter.propTypes = {
  defaultBIP32Path: PropTypes.string.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
  enableChangeMethod: PropTypes.func.isRequired,
  extendedPublicKeyImporter: PropTypes.shape({
    method: PropTypes.string,
    rootXfp: PropTypes.string,
  }).isRequired,
  fee: PropTypes.string.isRequired,
  inputsTotalSats: PropTypes.shape({}).isRequired,
  inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  isWallet: PropTypes.bool.isRequired,
  network: PropTypes.string.isRequired,
  outputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  signatureImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
    method: PropTypes.string,
  }).isRequired,
  signatureImporters: PropTypes.shape({}).isRequired,
  walletConfig: PropTypes.shape(walletConfigPropType).isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetSignature: PropTypes.func.isRequired,
};

export default DirectSignatureImporter;
