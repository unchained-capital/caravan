import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  validateHex,
  validateMultisigSignature,
  multisigBIP32Path,
  multisigBIP32Root,
  validateBIP32Path,
  getMaskedDerivation,
} from "unchained-bitcoin";
import { TREZOR, LEDGER, HERMIT, COLDCARD } from "unchained-wallets";
import {
  Card,
  CardHeader,
  CardContent,
  MenuItem,
  Button,
  Box,
  FormControl,
  TextField,
  Grid,
} from "@mui/material";
import Copyable from "../Copyable";
import TextSignatureImporter from "./TextSignatureImporter";
import DirectSignatureImporter from "./DirectSignatureImporter";
import HermitSignatureImporter from "../Hermit/HermitSignatureImporter";
import ColdcardSignatureImporter from "../Coldcard/ColdcardSignatureImporter";
import EditableName from "../EditableName";
import {
  setSignatureImporterName,
  setSignatureImporterMethod,
  setSignatureImporterBIP32Path,
  setSignatureImporterPublicKeys,
  setSignatureImporterSignature,
  setSignatureImporterFinalized,
  setSignatureImporterComplete,
} from "../../actions/signatureImporterActions";
import { setSigningKey as setSigningKeyAction } from "../../actions/transactionActions";
import { downloadFile } from "../../utils";

const TEXT = "text";
const UNKNOWN = "unknown";

class SignatureImporter extends React.Component {
  titleRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      disableChangeMethod: false,
      signedPsbt: "",
    };
  }

  componentDidMount = () => {
    this.resetBIP32Path();
    this.scrollToTitle();
  };

  componentDidUpdate = () => {
    this.scrollToTitle();
  };

  getCurrent() {
    const { signatureImporters } = this.props;
    return Object.keys(signatureImporters).reduce((o, k) => {
      return o + (signatureImporters[k].finalized ? 1 : 0);
    }, 1);
  }

  title = () => {
    const { number, signatureImporter, setName } = this.props;
    return (
      <EditableName
        number={number}
        name={signatureImporter.name}
        setName={setName}
      />
    );
  };

  scrollToTitle = () => {
    const { number } = this.props;
    if (number === this.getCurrent()) {
      this.titleRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  renderImport = () => {
    const { signatureImporter, number, isWallet } = this.props;
    const currentNumber = this.getCurrent();
    const notMyTurn = number > currentNumber;
    const { disableChangeMethod } = this.state;
    if (notMyTurn) {
      return (
        <p>
          Once you have imported the signature above, you will be able to import
          another signature here.
        </p>
      );
    }

    return (
      <form>
        <FormControl fullWidth>
          <TextField
            label="Select Method"
            id={`signature-${number}-importer-select`}
            select
            value={signatureImporter.method}
            variant="standard"
            disabled={disableChangeMethod}
            onChange={this.handleMethodChange}
          >
            <MenuItem value={UNKNOWN}>{"< Select method >"}</MenuItem>
            <MenuItem value={TREZOR}>Trezor</MenuItem>
            <MenuItem value={LEDGER}>Ledger</MenuItem>
            <MenuItem value={COLDCARD} disabled={!isWallet}>
              Coldcard
            </MenuItem>
            <MenuItem value={HERMIT}>Hermit</MenuItem>
            <MenuItem value={TEXT}>Enter as text</MenuItem>
          </TextField>
        </FormControl>

        {this.renderImportByMethod()}
      </form>
    );
  };

  renderImportByMethod = () => {
    const {
      network,
      signatureImporter,
      signatureImporters,
      inputs,
      inputsTotalSats,
      outputs,
      fee,
      isWallet,
      extendedPublicKeyImporter,
      unsignedPsbt,
      extendedPublicKeys,
      requiredSigners,
      addressType,
      walletName,
      ledgerPolicyHmacs,
      walletUuid,
    } = this.props;
    const { method } = signatureImporter;

    if (method === TREZOR || method === LEDGER) {
      return (
        <DirectSignatureImporter
          network={network}
          signatureImporter={signatureImporter}
          signatureImporters={signatureImporters}
          inputs={inputs}
          outputs={outputs}
          inputsTotalSats={inputsTotalSats}
          fee={fee}
          isWallet={isWallet}
          extendedPublicKeyImporter={extendedPublicKeyImporter}
          validateAndSetBIP32Path={this.validateAndSetBIP32Path}
          resetBIP32Path={this.resetBIP32Path}
          defaultBIP32Path={this.defaultBIP32Path()}
          validateAndSetSignature={this.validateAndSetSignature}
          enableChangeMethod={this.enableChangeMethod}
          disableChangeMethod={this.disableChangeMethod}
          walletConfig={{
            addressType,
            network,
            quorum: { requiredSigners },
            extendedPublicKeys,
            uuid: walletUuid,
            name: walletName,
            ledgerPolicyHmacs,
          }}
        />
      );
    }
    if (method === HERMIT) {
      return (
        <HermitSignatureImporter
          network={network}
          signatureImporter={signatureImporter}
          inputs={inputs}
          outputs={outputs}
          inputsTotalSats={inputsTotalSats}
          fee={fee}
          unsignedPsbt={unsignedPsbt}
          extendedPublicKeyImporter={extendedPublicKeyImporter}
          validateAndSetBIP32Path={this.validateAndSetBIP32Path}
          resetBIP32Path={this.resetBIP32Path}
          defaultBIP32Path={this.defaultBIP32Path()}
          validateAndSetSignature={this.validateAndSetSignature}
          enableChangeMethod={this.enableChangeMethod}
          disableChangeMethod={this.disableChangeMethod}
        />
      );
    }
    if (method === COLDCARD) {
      return (
        <ColdcardSignatureImporter
          network={network}
          signatureImporter={signatureImporter}
          inputs={inputs}
          outputs={outputs}
          inputsTotalSats={inputsTotalSats}
          fee={fee}
          extendedPublicKeyImporter={extendedPublicKeyImporter}
          validateAndSetSignature={this.validateAndSetSignature}
        />
      );
    }
    if (method === TEXT) {
      return (
        <TextSignatureImporter
          signatureImporter={signatureImporter}
          validateAndSetSignature={this.validateAndSetSignature}
        />
      );
    }
    return null;
  };

  //
  // Method
  //

  handleMethodChange = (event) => {
    const { number, setMethod } = this.props;
    setMethod(number, event.target.value);
    this.reset();
  };

  disableChangeMethod = () => {
    this.setState({ disableChangeMethod: true });
  };

  enableChangeMethod = () => {
    this.setState({ disableChangeMethod: false });
  };

  //
  // State
  //

  reset = () => {
    const { number, setSignature, setPublicKeys, setFinalized } = this.props;
    setSignature(number, "");
    setPublicKeys(number, []);
    setFinalized(number, false);
  };

  //
  // BIP32 Path
  //

  defaultBIP32Path = () => {
    const { addressType, network, isWallet } = this.props;
    return isWallet
      ? multisigBIP32Root(addressType, network)
      : multisigBIP32Path(addressType, network);
  };

  resetBIP32Path = () => {
    const { number, setBIP32Path, isWallet } = this.props;
    if (isWallet) {
      const { extendedPublicKeyImporter } = this.props;
      if (
        extendedPublicKeyImporter &&
        extendedPublicKeyImporter.method !== "text"
      )
        return;
    }
    setBIP32Path(number, this.defaultBIP32Path());
  };

  validateAndSetBIP32Path = (bip32Path, callback, errback, options) => {
    const { number, setBIP32Path } = this.props;
    const error = validateBIP32Path(bip32Path, options);
    setBIP32Path(number, bip32Path);
    if (error) {
      errback(error);
    } else {
      errback("");
      callback();
    }
  };

  //
  // Signature
  //

  renderSignature = () => {
    const { signatureImporter, txid } = this.props;
    const { signedPsbt } = this.state;
    const signatureJSON = JSON.stringify(signatureImporter.signature);
    return (
      <div>
        <p>The following signature was imported:</p>
        <Box>
          <Copyable text={signatureJSON} showIcon code />
        </Box>
        {signedPsbt && (
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => this.handleDownloadPSBT(signedPsbt)}
            >
              Download Signed PSBT
            </Button>
          </Grid>
        )}
        <Box mt={2}>
          <Button
            variant="contained"
            color="secondary"
            disabled={txid !== ""}
            size="small"
            onClick={this.reset}
          >
            Remove Signature
          </Button>
        </Box>
      </div>
    );
  };

  handleDownloadPSBT = (psbtBase64) => {
    downloadFile(psbtBase64, "signed.psbt");
  };

  validateAndSetSignature = (inputsSignatures, errback, signedPsbt) => {
    const {
      number,
      inputs,
      signatureImporters,
      setComplete,
      network,
      outputs,
      setSigningKey,
    } = this.props;
    this.setState({ signedPsbt });
    if (!Array.isArray(inputsSignatures)) {
      errback("Signature is not an array of strings.");
      return;
    }

    if (inputsSignatures.length < inputs.length) {
      errback(
        "Not enough signatures (must be at least one signature for each input)."
      );
      return;
    }

    if (inputsSignatures.length % inputs.length !== 0) {
      errback("Number of signatures must be a multiple of number of inputs.");
      return;
    }

    const numSignatureSets = inputsSignatures.length / inputs.length;

    if (numSignatureSets > Object.values(signatureImporters).length) {
      errback(
        "Too many signatures. Max one set of signatures per required signer."
      );
      return;
    }
    const publicKeys = [];
    if (numSignatureSets === 1) {
      const finalizedSignatureImporters = Object.values(
        signatureImporters
      ).filter((signatureImporter) => signatureImporter.finalized);
      for (
        let inputIndex = 0;
        inputIndex < inputsSignatures.length;
        inputIndex += 1
      ) {
        const inputNumber = inputIndex + 1;
        const inputSignature = inputsSignatures[inputIndex];
        if (validateHex(inputSignature) !== "") {
          errback(`Signature for input ${inputNumber} is not valid hex.`);
          return;
        }

        let publicKey;
        try {
          publicKey = validateMultisigSignature(
            network,
            inputs,
            outputs,
            inputIndex,
            inputSignature
          );
        } catch (e) {
          errback(`Signature for input ${inputNumber} is invalid.`);
          return;
        }
        if (publicKey) {
          for (
            let finalizedSignatureImporterNum = 0;
            finalizedSignatureImporterNum < finalizedSignatureImporters.length;
            finalizedSignatureImporterNum += 1
          ) {
            const finalizedSignatureImporter =
              finalizedSignatureImporters[finalizedSignatureImporterNum];

            if (
              finalizedSignatureImporter.signature[inputIndex] ===
                inputSignature ||
              finalizedSignatureImporter.publicKeys[inputIndex] === publicKey
            ) {
              errback(
                `Signature for input ${inputNumber} is a duplicate of a previously provided signature.`
              );
              return;
            }
          }
          publicKeys.push(publicKey);
        } else {
          errback(`Signature for input ${inputNumber} is invalid.`);
          return;
        }
      }
      setComplete(number, {
        signature: inputsSignatures,
        publicKeys,
        finalized: true,
      });
    } else {
      // We land here if a PSBT has been uploaded with multiple signature sets.
      // In case we already have some signatures saved, e.g. first a singly-signed
      // PSBT was uploaded, and now a doubly-signed PSBT was uploaded, filter out
      // the known signatures.
      let signaturesToCheck = this.filterKnownSignatures(inputsSignatures);
      let signatureSetNumber = number; // so we can iterate, number is a const from props.

      while (
        signatureSetNumber <= Object.keys(signatureImporters).length &&
        signaturesToCheck.length > 0
      ) {
        setSigningKey(signatureSetNumber, signatureSetNumber - 1);
        const signatureSet = [];
        const publicKeySet = [];

        // Loop over inputs and check the sigs array to see if you can find a public key or not.
        // NOTE - signaturesToCheck.length could be much larger than inputs.length!
        // This is *not* efficient, but it will work as a temporary solution until we refactor
        // the signatures data structure returned from unchained-bitcoin or change how caravan
        // validates signatures.

        // The "sets" of signatures that come out of this process are not all connected /  tied to the same root xpub
        // because we've truncated a little information in the psbt parsing => signature return process
        // We can re-generate that information later but for now this should work. There are
        // bugs in edge cases that need to be handled better.
        for (let inputIndex = 0; inputIndex < inputs.length; inputIndex += 1) {
          let publicKey;

          // THIS NEEDS TO BE MORE OPINIONATED ABOUT *WHICH* SIGNING DEVICE ARE THESE PUBKEYS COMING FROM
          // e.g. after the first round of this loop if you successfully find a public key -- that public key
          // is derived from some root xpub with a particular fingerprint, as you move along this loop to the
          // next input, you want to *keep* searching until you find a public key that's from the same root fingerprint.
          // Meaning a member of the same signatureSet. All of the remaining publicKey solutions in this round of
          // signature validation should be derived from the *same* xpub.
          //
          // This assumption is not held if you're just blindly searching for *any* (or the first) valid public key
          // within the list of signatures. E.g. there are multiple *valid* publicKeys for every input if we're at
          // this point in the code. But if you don't pay attention to the root xpub as you assign public keys to
          // a signatureSet, you will get a row of public keys that *may not* all be associated with any particular
          // ExtendedPublicKey. Obviously that's not quite right. But if uploaded PSBT is fully signed, then this
          // should not matter and the transaction should validate, build, and be able to be broadcast.
          for (let i = 0; i < signaturesToCheck.length; i += 1) {
            const inputSignature = signaturesToCheck[i];
            if (validateHex(inputSignature) !== "") {
              errback(
                `Signature for input at index ${inputIndex} is not valid hex.`
              );
              return;
            }
            try {
              // This returns false if it completes with no error
              publicKey = validateMultisigSignature(
                network,
                inputs,
                outputs,
                inputIndex,
                inputSignature
              );
            } catch (e) {
              // eslint-disable-next-line no-console
              console.error(e);
            }
            // FIXME `&& publicKey is member of a particular root xpub/fingerprint` should be added here!
            if (publicKey) {
              // We know inputSignature is a signature for publicKey but we aren't keeping root xpub/xfp info around
              publicKeySet.push(publicKey);
              signatureSet.push(inputSignature);
              break;
            }
          }
          if (!publicKey) {
            errback(`No valid signature for input ${inputIndex} found.`);
            return;
          }
        }
        if (
          publicKeySet.length !== inputs.length ||
          signatureSet.length !== inputs.length
        ) {
          errback(`There was an error in validating the transaction.`);
          return;
        }
        // Set the signatureSetNumber we're currently on to complete and include publicKeySet/signatureSet
        setComplete(signatureSetNumber, {
          signature: signatureSet,
          publicKeySet,
          finalized: true,
        });
        // Send signatures to this method again, since now some of them are marked
        // as finalized, and they will be filtered out.
        signaturesToCheck = this.filterKnownSignatures(inputsSignatures);
        // increment which signature number we're working on next.
        signatureSetNumber += 1;
      }
    }
  };

  filterKnownSignatures = (inputsSignatures) => {
    const { inputs, signatureImporters } = this.props;
    const finalizedSignatureImporters = Object.values(
      signatureImporters
    ).filter((signatureImporter) => signatureImporter.finalized);
    const knownSignatures = [];
    for (let inputIndex = 0; inputIndex < inputs.length; inputIndex += 1) {
      for (
        let finalizedSignatureImporterNum = 0;
        finalizedSignatureImporterNum < finalizedSignatureImporters.length;
        finalizedSignatureImporterNum += 1
      ) {
        const finalizedSignatureImporter =
          finalizedSignatureImporters[finalizedSignatureImporterNum];

        knownSignatures.push(finalizedSignatureImporter.signature[inputIndex]);
      }
    }
    // diff out any signature we've seen before
    return inputsSignatures.filter((x) => !knownSignatures.includes(x));
  };

  render() {
    const { signatureImporter } = this.props;
    return (
      <Card>
        <CardHeader title={this.title()} ref={this.titleRef} />
        <CardContent>
          {signatureImporter.finalized
            ? this.renderSignature()
            : this.renderImport()}
        </CardContent>
      </Card>
    );
  }
}

SignatureImporter.propTypes = {
  addressType: PropTypes.string.isRequired,
  extendedPublicKeyImporter: PropTypes.shape({
    method: PropTypes.string,
  }),
  extendedPublicKeys: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      rootFingerprint: PropTypes.string,
      base58String: PropTypes.string,
    })
  ).isRequired,
  fee: PropTypes.string.isRequired,
  inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  inputsTotalSats: PropTypes.shape({}).isRequired,
  isWallet: PropTypes.bool.isRequired,
  network: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
  outputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  requiredSigners: PropTypes.number.isRequired,
  setName: PropTypes.func.isRequired,
  setMethod: PropTypes.func.isRequired,
  setBIP32Path: PropTypes.func.isRequired,
  setSignature: PropTypes.func.isRequired,
  setPublicKeys: PropTypes.func.isRequired,
  setFinalized: PropTypes.func.isRequired,
  setComplete: PropTypes.func.isRequired,
  signatureImporter: PropTypes.shape({
    finalized: PropTypes.bool,
    name: PropTypes.string,
    method: PropTypes.string,
    signature: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),
  }).isRequired,
  signatureImporters: PropTypes.shape({}).isRequired,
  txid: PropTypes.string.isRequired,
  unsignedTransaction: PropTypes.shape({}).isRequired,
  setSigningKey: PropTypes.func.isRequired,
  unsignedPsbt: PropTypes.string,
  walletName: PropTypes.string.isRequired,
  walletUuid: PropTypes.string.isRequired,
  // eslint-disable-next-line react/forbid-prop-types
  ledgerPolicyHmacs: PropTypes.array.isRequired,
};

SignatureImporter.defaultProps = {
  extendedPublicKeyImporter: {},
  unsignedPsbt: "",
};

function mapStateToProps(state, ownProps) {
  return {
    ...{
      signatureImporters: state.spend.signatureImporters,
      signatureImporter: state.spend.signatureImporters[ownProps.number],
      fee: state.spend.transaction.fee,
      txid: state.spend.transaction.txid,
      walletName: state.wallet.common.walletName,
      walletUuid: state.wallet.common.walletUuid,
    },
    ...state.spend.transaction,
    requiredSigners: state.settings.requiredSigners,
    ledgerPolicyHmacs: state.wallet.common.ledgerPolicyHmacs,
    extendedPublicKeys: Object.values(state.quorum.extendedPublicKeyImporters)
      .filter((key) => key.extendedPublicKey)
      .map((key) => ({
        bip32Path: getMaskedDerivation({
          xpub: key.extendedPublicKey,
          bip32Path: key.bip32Path,
        }),
        xfp: key.rootXfp,
        xpub: key.extendedPublicKey,
      })),
  };
}

const mapDispatchToProps = {
  setName: setSignatureImporterName,
  setMethod: setSignatureImporterMethod,
  setBIP32Path: setSignatureImporterBIP32Path,
  setPublicKeys: setSignatureImporterPublicKeys,
  setSignature: setSignatureImporterSignature,
  setFinalized: setSignatureImporterFinalized,
  setComplete: setSignatureImporterComplete,
  setSigningKey: setSigningKeyAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(SignatureImporter);
