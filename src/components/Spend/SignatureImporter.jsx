import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  validateHex,
  validateMultisigSignature,
  multisigBIP32Path,
  validateBIP32Path,
} from 'unchained-bitcoin';
import {
  TREZOR,
  LEDGER,
  HERMIT,
} from "unchained-wallets";
import {wrapText,} from "../../utils";

// Components
import {
  Card,
  CardHeader,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Grid,
  Box,
  FormControl,
} from '@material-ui/core';
import Copyable from "../Copyable";
import TextSignatureImporter from "./TextSignatureImporter";
import HermitSignatureImporter from "./HermitSignatureImporter";
import HardwareWalletSignatureImporter from "./HardwareWalletSignatureImporter";
import EditableName from "../EditableName";

// Actions
import {
  setSignatureImporterName,
  setSignatureImporterMethod,
  setSignatureImporterBIP32Path,
  setSignatureImporterPublicKeys,
  setSignatureImporterSignature,
  setSignatureImporterFinalized,
  setSignatureImporterComplete,
} from "../../actions/signatureImporterActions";

import 'react-table/react-table.css';

const TEXT = "text";

class SignatureImporter extends React.Component {

  titleRef = React.createRef();

  static propTypes = {
    number: PropTypes.number.isRequired,
    signatureImporter: PropTypes.shape({}).isRequired,
    signatureImporters: PropTypes.shape({}).isRequired,
    inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    inputsTotalSats:  PropTypes.object.isRequired,
    outputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
    unsignedTransaction: PropTypes.object.isRequired,
    addressType: PropTypes.string.isRequired,
    network: PropTypes.string.isRequired,
    fee: PropTypes.string.isRequired,
    txid: PropTypes.string.isRequired,
    setName: PropTypes.func.isRequired,
    setMethod: PropTypes.func.isRequired,
    setBIP32Path: PropTypes.func.isRequired,
    setSignature: PropTypes.func.isRequired,
    setPublicKeys: PropTypes.func.isRequired,
    setFinalized: PropTypes.func.isRequired,
    setComplete: PropTypes.func.isRequired,
  };

  state = {
    disableChangeMethod: false,
    showUnsignedTransaction: false,
  };

  componentDidMount = () => {
    this.resetBIP32Path();
    this.scrollToTitle();
  }

  componentDidUpdate = () => {
    this.scrollToTitle();
  }

  scrollToTitle = () => {
    const {number} = this.props;
    if (number === this.getCurrent()) {
      this.titleRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }

  render() {
    const { signatureImporter } = this.props;
    return (
      <Card>
        <CardHeader title={this.title()} ref={this.titleRef}/>
        <CardContent>
          {signatureImporter.finalized ? this.renderSignature() : this.renderImport()}
          <Box mt={2}>
            {this.renderUnsignedTransaction()}
          </Box>
        </CardContent>
      </Card>
    );
  }

  title = () => {
    const {number, signatureImporter, setName} = this.props;
    return <EditableName number={number} name={signatureImporter.name} setName={setName} />;
  }

  getCurrent() {
    const { signatureImporters } = this.props;
    return Object.keys(signatureImporters).reduce((o, k) => {
      return o + (signatureImporters[k].finalized ? 1 : 0)
    }, 1);
  }

  renderImport = () => {
    const { signatureImporter, number } = this.props;
    const currentNumber = this.getCurrent();
    const notMyTurn =  (number > currentNumber);
    const { disableChangeMethod } = this.state;
    const labelId = `signature-${number}-importer-select-label`;
    if (notMyTurn) {
      return (
        <p>
          Once you have imported the signature above, you will be able to import another signature here.
        </p>
      );
    }

    return (
      <form>

        <FormControl fullWidth>
          <InputLabel id={labelId}>Select Method</InputLabel>

          <Select
            labelId={labelId}
            id={`signature-${number}-importer-select`}
            disabled={disableChangeMethod}
            value={signatureImporter.method}
            onChange={this.handleMethodChange}
          >
            <MenuItem value="">{'< Select method >'}</MenuItem>
            <MenuItem value={TREZOR}>Trezor</MenuItem>
            <MenuItem value={LEDGER}>Ledger</MenuItem>
            <MenuItem value={HERMIT}>Hermit</MenuItem>
            <MenuItem value={TEXT}>Enter as text</MenuItem>
          </Select>
        </FormControl>

        {this.renderImportByMethod()}

      </form>
    );
  }

  renderImportByMethod = () => {
    const {network, signatureImporter, signatureImporters, inputs, inputsTotalSats,  outputs, fee} = this.props;
    if (signatureImporter.method === TEXT) {
      return <TextSignatureImporter
                               signatureImporter={signatureImporter}
                               validateAndSetSignature={this.validateAndSetSignature} />;
    }
    if (signatureImporter.method === HERMIT) {
      return <HermitSignatureImporter
               network={network}
               signatureImporter={signatureImporter}
               inputs={inputs}
               outputs={outputs}
               validateAndSetBIP32Path={this.validateAndSetBIP32Path}
               resetBIP32Path={this.resetBIP32Path}
               defaultBIP32Path={this.defaultBIP32Path()}
               validateAndSetSignature={this.validateAndSetSignature}
               enableChangeMethod={this.enableChangeMethod}
               disableChangeMethod={this.disableChangeMethod} />;
    }
    if (signatureImporter.method === TREZOR || signatureImporter.method === LEDGER) {
      return <HardwareWalletSignatureImporter
               network={network}
               signatureImporter={signatureImporter}
               signatureImporters={signatureImporters}
               inputs={inputs}
               outputs={outputs}
               inputsTotalSats={inputsTotalSats}
               fee={fee}
               validateAndSetBIP32Path={this.validateAndSetBIP32Path}
               resetBIP32Path={this.resetBIP32Path}
               defaultBIP32Path={this.defaultBIP32Path()}
               validateAndSetSignature={this.validateAndSetSignature}
               enableChangeMethod={this.enableChangeMethod}
               disableChangeMethod={this.disableChangeMethod} />;
    }
    return null;
  }

  //
  // Method
  //

  handleMethodChange = (event) => {
    const { number, setMethod } = this.props;
    setMethod(number, event.target.value);
    this.reset();
  }

  disableChangeMethod = () => {
    this.setState({disableChangeMethod: true});
  }

  enableChangeMethod = () => {
    this.setState({disableChangeMethod: false});
  }

  //
  // Unsigned Transaction
  //

  renderUnsignedTransaction = () => {
    const {showUnsignedTransaction} = this.state;
    const {unsignedTransaction} = this.props;
    if (showUnsignedTransaction) {
      const hex = unsignedTransaction.toHex();
      return (
        <div>
          <p><Copyable text={hex}><code>{wrapText(hex)}</code></Copyable></p>
          <small>
            <Button size="small" onClick={this.handleHideUnsignedTransaction}>
              Hide Unsigned Transaction
            </Button>
          </small>
        </div>

      );
    } else {
      return (
        <small>
          <Button size="small" onClick={this.handleShowUnsignedTransaction}>
            Show Unsigned Transaction
          </Button>
        </small>
      );
    }
  }

  handleShowUnsignedTransaction = () => {
    this.setState({showUnsignedTransaction: true});
  }

  handleHideUnsignedTransaction = () => {
    this.setState({showUnsignedTransaction: false});
  }


  //
  // State
  //

  reset = () => {
    const { number, setSignature, setPublicKeys, setFinalized } = this.props;
    setSignature(number, '');
    setPublicKeys(number, []);
    setFinalized(number, false);
  }

  //
  // BIP32 Path
  //

  defaultBIP32Path = () => {
    const {addressType, network} = this.props;
    return multisigBIP32Path(addressType, network);
  }

  resetBIP32Path = () => {
    const {number, setBIP32Path} = this.props;
    setBIP32Path(number, this.defaultBIP32Path());
  }

  validateAndSetBIP32Path = (bip32Path, callback, errback, options) => {
    const {number, setBIP32Path} = this.props;
    const error = validateBIP32Path(bip32Path, options);
    setBIP32Path(number, bip32Path);
    if (error) {
      errback(error);
    } else {
      errback('');
      callback();
    }
  }


  //
  // Signature
  //

  renderSignature = () => {
    const { signatureImporter, txid  } = this.props;
    const signatureJSON =  JSON.stringify(signatureImporter.signature);
    return (
      <div>
        <p>The following signature was imported:</p>
        <Grid container justify="center">
          <Copyable text={signatureJSON}>
            <small><code>{wrapText(signatureJSON, 128)}</code></small>
          </Copyable>
        </Grid>
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
  }

  validateAndSetSignature = (inputsSignatures, errback) => {
    const {number, inputs, signatureImporters, unsignedTransaction, setComplete} = this.props;

    if (!Array.isArray(inputsSignatures)) {
      errback("Signature is not an array of strings.");
      return;
    }

    if (inputsSignatures.length < inputs.length) {
      errback("Not enough signatures (must be exactly one for each input).");
      return;
    }
    if (inputsSignatures.length > inputs.length) {
      errback("Too many signatures (must be exactly one for each input).");
      return;
    }

    const publicKeys = [];
    const finalizedSignatureImporters = Object.values(signatureImporters).filter((signatureImporter) => (signatureImporter.finalized));
    for (let inputIndex = 0; inputIndex < inputsSignatures.length; inputIndex += 1) {
      const input = inputs[inputIndex];
      const inputNumber = inputIndex + 1;
      const inputSignature = inputsSignatures[inputIndex];
      if (validateHex(inputSignature) !== '') {
        errback(`Signature for input ${inputNumber} is not valid hex.`);
        return;
      }

      let publicKey;
      try{
        publicKey = validateMultisigSignature(unsignedTransaction, inputIndex, input, inputSignature);
      } catch(e) {
        errback(`Signature for input ${inputNumber} is invalid.`);
        return;
      }
      if (publicKey) {
        for (let finalizedSignatureImporterNum=0; finalizedSignatureImporterNum < finalizedSignatureImporters.length; finalizedSignatureImporterNum++) {
          const finalizedSignatureImporter = finalizedSignatureImporters[finalizedSignatureImporterNum];

          if (finalizedSignatureImporter.signature[inputIndex] === inputSignature || finalizedSignatureImporter.publicKeys[inputIndex] === publicKey) {
            errback(`Signature for input ${inputNumber} is a duplicate of a previously provided signature.`);
            return;
          }
        }
        publicKeys.push(publicKey);
      } else {
        errback(`Signature for input ${inputNumber} is invalid.`);
        return;
      }
    }

    setComplete(number, {signature: inputsSignatures, publicKeys: publicKeys, finalized: true});
  }


}

function mapStateToProps(state, ownProps) {
  return {
    ...{
      signatureImporters: state.spend.signatureImporters,
      signatureImporter: state.spend.signatureImporters[ownProps.number],
      fee: state.spend.transaction.fee,
      txid: state.spend.transaction.txid,
    },
    ...state.spend.transaction,
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
};

export default connect(mapStateToProps, mapDispatchToProps)(SignatureImporter);
