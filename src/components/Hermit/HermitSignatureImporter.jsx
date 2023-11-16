import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  networkData,
  parseSignatureArrayFromPSBT,
  unsignedMultisigPSBT,
} from "unchained-bitcoin";
import {
  HERMIT,
  PENDING,
  UNSUPPORTED,
  SignMultisigTransaction,
} from "unchained-wallets";
import { Grid, Box, TextField, Button, FormHelperText } from "@mui/material";
import { Psbt } from "bitcoinjs-lib";
import HermitReader from "./HermitReader";
import HermitDisplayer from "./HermitDisplayer";
import InteractionMessages from "../InteractionMessages";
import { setUnsignedPSBT as setUnsignedPSBTAction } from "../../actions/transactionActions";

class HermitSignatureImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bip32PathError: "",
      signatureError: "",
      status: this.interaction().isSupported() ? PENDING : UNSUPPORTED,
      displaySignatureRequest: false,
    };
  }

  // from gh buidl-bitcoin/buidl-python/blob/d79e9808e8ca60975d315be41293cb40d968626d/buidl/helper.py#L350-L379

  childToPath = (child) => {
    let hardenedPath = child;
    let toReturn = `/${child}`;
    if (hardenedPath >= 0x80000000) {
      hardenedPath -= 0x80000000;
      toReturn = `/${hardenedPath}'`;
    }
    return toReturn;
  };

  parseBinaryPath = (binPath) => {
    let path = "m";
    let pathData = Buffer.from(binPath);
    while (pathData.length > 0) {
      const childNum = Buffer.from(pathData.slice(0, 4)).readUIntLE(0, 4);
      path += this.childToPath(childNum);
      pathData = pathData.subarray(4);
    }
    return path;
  };

  interaction = () => {
    const {
      unsignedPsbt,
      network,
      inputs,
      outputs,
      setUnsignedPSBT,
      unsignedPsbtFromState,
    } = this.props;
    let psbtToSign;

    // We need to be flexible here because this signature importer is used in multiple places
    // And the user *could* have uploaded their own PSBT, and that uploaded PSBT *could* also
    // be a scaffolded PSBT without any inputs.

    if (unsignedPsbtFromState === "" && inputs.length > 0) {
      psbtToSign = unsignedMultisigPSBT(
        network,
        inputs,
        outputs,
        true
      ).toBase64();

      setUnsignedPSBT(psbtToSign);

      return SignMultisigTransaction({
        keystore: HERMIT,
        psbt: psbtToSign,
      });
    }

    const psbt = Psbt.fromBase64(
      unsignedPsbt === "" ? unsignedPsbtFromState : unsignedPsbt,
      {
        network: networkData(network),
      }
    );

    // if the unsignedPsbt doesn't have any inputs/outputs, that means we're in the ppk recovery case
    // so we need to add in the inputs and outputs from the redux store and then use *that* as the unsigned psbt
    if (psbt.data.inputs.length === 0) {
      psbt.setVersion(1);

      const b32d = psbt.data.globalMap.unknownKeyVals[1];

      const derivation = b32d.value
        .slice(1)
        .toString("hex")
        .split("de")
        .map((p) => [
          Buffer.from(p.slice(0, 8), "hex"),
          this.parseBinaryPath(Buffer.from(p.slice(8), "hex")),
        ]);

      psbt.addInputs(
        Object.values(inputs).map((i) => ({
          hash: i.txid,
          index: i.index,
          nonWitnessUtxo: Buffer.from(i.transactionHex, "hex"),
          redeemScript: i.multisig.redeem.output,
          bip32Derivation: i.multisig.redeem.pubkeys.map((pk, idx) => {
            return {
              masterFingerprint: derivation[idx][0],
              path: derivation[idx][1],
              pubkey: pk,
            };
          }),
        }))
      );
      psbt.addOutputs(
        Object.values(outputs).map((o) => ({
          address: o.address,
          value: Number(o.amountSats),
        }))
      );

      psbtToSign = psbt.toBase64();
      setUnsignedPSBT(psbtToSign);
    } else {
      psbtToSign = unsignedPsbt === "" ? unsignedPsbtFromState : unsignedPsbt;
    }

    return SignMultisigTransaction({
      keystore: HERMIT,
      psbt: psbtToSign,
    });
  };

  handleShowSignatureRequest = () => {
    this.setState({ displaySignatureRequest: true });
  };

  handleHideSignatureRequest = () => {
    this.setState({ displaySignatureRequest: false });
  };

  render = () => {
    const { signatureImporter, disableChangeMethod, resetBIP32Path } =
      this.props;
    const { bip32PathError, signatureError, status, displaySignatureRequest } =
      this.state;
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
              variant="standard"
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
          {displaySignatureRequest ? (
            <Grid container justifyContent="center">
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

          <HermitReader
            startText="Scan Signature QR Code"
            interaction={interaction}
            onStart={disableChangeMethod}
            onSuccess={this.import}
            onClear={this.clear}
            width="640px"
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
    const {
      validateAndSetSignature,
      enableChangeMethod,
      unsignedPsbtFromState,
      network,
    } = this.props;
    this.setState({ signatureError: "" });
    enableChangeMethod();
    const signedPsbt = this.interaction().parse(signature);
    // Signed PSBT from Hermit may be an extremely stripped down version
    const unsignedPsbtStateObject = Psbt.fromBase64(unsignedPsbtFromState, {
      network: networkData(network),
    });
    const reconstitutedPsbt = unsignedPsbtStateObject.combine(
      Psbt.fromBase64(signedPsbt, { network: networkData(network) })
    );

    const signatureArray = parseSignatureArrayFromPSBT(
      reconstitutedPsbt.toBase64()
    );
    validateAndSetSignature(
      signatureArray,
      (signatureError) => {
        this.setState({ signatureError });
      },
      reconstitutedPsbt.toBase64()
    );
  };

  clear = () => {
    const { enableChangeMethod } = this.props;
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
  signatureImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
  }).isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  setUnsignedPSBT: PropTypes.func.isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  validateAndSetBIP32Path: PropTypes.func.isRequired,
  validateAndSetSignature: PropTypes.func.isRequired,
  enableChangeMethod: PropTypes.func.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
  unsignedPsbt: PropTypes.string,
  unsignedPsbtFromState: PropTypes.string.isRequired,
  network: PropTypes.string,
  inputs: PropTypes.arrayOf(PropTypes.shape({})),
  outputs: PropTypes.arrayOf(PropTypes.shape({})),
};

HermitSignatureImporter.defaultProps = {
  unsignedPsbt: "",
  network: "",
  inputs: [],
  outputs: [],
};

function mapStateToProps(state) {
  return {
    ...state.spend.transaction,
    unsignedPsbtFromState: state.spend.transaction.unsignedPSBT,
  };
}

const mapDispatchToProps = {
  setUnsignedPSBT: setUnsignedPSBTAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HermitSignatureImporter);
