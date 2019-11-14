import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  validateBIP32Path,
  validateExtendedPublicKey,
} from 'unchained-bitcoin';
import {
  TREZOR,
  LEDGER,
  HERMIT,
} from "unchained-wallets";

// Components
import {
  Card, CardHeader, CardContent,
  FormControl, Select, MenuItem,
  InputLabel, Button,
} from '@material-ui/core';
import Copyable from "../Copyable";
import ExtendedPublicKeyExtendedPublicKeyImporter from "./ExtendedPublicKeyExtendedPublicKeyImporter";
import TextExtendedPublicKeyImporter from "./TextExtendedPublicKeyImporter";
import HermitExtendedPublicKeyImporter from "./HermitExtendedPublicKeyImporter";
import HardwareWalletExtendedPublicKeyImporter from "./HardwareWalletExtendedPublicKeyImporter";
import EditableName from "../EditableName";

// Actions
import {
  setExtendedPublicKeyImporterName,
  resetExtendedPublicKeyImporterBIP32Path,
  setExtendedPublicKeyImporterBIP32Path,
  setExtendedPublicKeyImporterMethod,
  setExtendedPublicKeyImporterExtendedPublicKey,
  setExtendedPublicKeyImporterFinalized,
} from '../../actions/extendedPublicKeyImporterActions';

const XPUB = "xpub";
const TEXT = "text";

class ExtendedPublicKeyImporter extends React.Component {

  static propTypes =  {
    network: PropTypes.string.isRequired,
    number: PropTypes.number.isRequired,
    extendedPublicKeyImporter: PropTypes.shape({}).isRequired,
    extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
    defaultBIP32Path: PropTypes.string.isRequired,
    addressType: PropTypes.string.isRequired,
    setName: PropTypes.func.isRequired,
    setBIP32Path: PropTypes.func.isRequired,
    resetBIP32Path: PropTypes.func.isRequired,
    setMethod: PropTypes.func.isRequired,
    setExtendedPublicKey: PropTypes.func.isRequired,
    setFinalized: PropTypes.func.isRequired,
  };

  state = {
    disableChangeMethod: false,

  };

  render() {
    const { extendedPublicKeyImporter } = this.props;
    return (
      <Card>
        <CardHeader title={this.title()}/>
        <CardContent>
        {extendedPublicKeyImporter.finalized ? this.renderExtendedPublicKey() : this.renderImport()}
        </CardContent>
      </Card>
    );
  }

  title = () => {
    const {number, extendedPublicKeyImporter, setName} = this.props;
    return <EditableName number={number} name={extendedPublicKeyImporter.name} setName={setName} />;
  }

  renderImport = () => {
    const { extendedPublicKeyImporter, number } = this.props;
    const { disableChangeMethod } = this.state;
    const labelId = `xpub-${number}-importer-select-label`;
    return (
      <div>
        <FormControl fullWidth>
          <InputLabel id={labelId}>Select Method</InputLabel>

          <Select
            labelId={labelId}
            id={`public-key-${number}-importer-select`}
            disabled={disableChangeMethod}
            value={extendedPublicKeyImporter.method}
            onChange={this.handleMethodChange}
          >
            <MenuItem value="">{'< Select method >'}</MenuItem>
            <MenuItem value={TREZOR}>Trezor</MenuItem>
            <MenuItem value={LEDGER}>Ledger</MenuItem>
            <MenuItem value={HERMIT}>Hermit</MenuItem>
            <MenuItem value={XPUB}>Derive from extended public key</MenuItem>
            <MenuItem value={TEXT}>Enter as text</MenuItem>
          </Select>

        </FormControl>

        {this.renderImportByMethod()}

      </div>
    );
  }

  renderImportByMethod = () => {
    const {extendedPublicKeyImporters, extendedPublicKeyImporter, network, addressType, defaultBIP32Path} = this.props;
    if (extendedPublicKeyImporter.method === TREZOR || extendedPublicKeyImporter.method === LEDGER) {
      return <HardwareWalletExtendedPublicKeyImporter
               extendedPublicKeyImporter={extendedPublicKeyImporter}
               validateAndSetExtendedPublicKey={this.validateAndSetExtendedPublicKey}
               validateAndSetBIP32Path={this.validateAndSetBIP32Path}
               resetBIP32Path={this.resetBIP32Path}
               enableChangeMethod={this.enableChangeMethod}
               disableChangeMethod={this.disableChangeMethod}
               addressType={addressType}
               defaultBIP32Path={defaultBIP32Path}
               network={network} />;
    }
    if (extendedPublicKeyImporter.method === HERMIT) {
      return <HermitExtendedPublicKeyImporter
               extendedPublicKeyImporter={extendedPublicKeyImporter}
               validateAndSetExtendedPublicKey={this.validateAndSetExtendedPublicKey}
               validateAndSetBIP32Path={this.validateAndSetBIP32Path}
               enableChangeMethod={this.enableChangeMethod}
               disableChangeMethod={this.disableChangeMethod}
               resetBIP32Path={this.resetBIP32Path}
               reset={this.reset} />;
    }
    if (extendedPublicKeyImporter.method === XPUB) {
      return <ExtendedPublicKeyExtendedPublicKeyImporter
               extendedPublicKeyImporter={extendedPublicKeyImporter}
               extendedPublicKeyImporters={extendedPublicKeyImporters}
               validateAndSetExtendedPublicKey={this.validateAndSetExtendedPublicKey}
               network={network}
               validateAndSetBIP32Path={this.validateAndSetBIP32Path} />;
    }
    if (extendedPublicKeyImporter.method === TEXT) {
      return <TextExtendedPublicKeyImporter
               extendedPublicKeyImporter={extendedPublicKeyImporter}
               validateAndSetExtendedPublicKey={this.validateAndSetExtendedPublicKey} />;
    }
    return null;
  }

  //
  // Method
  //

  handleMethodChange = (event) => {
    const { number, setMethod, setExtendedPublicKey } = this.props;
    setMethod(number, event.target.value);
    setExtendedPublicKey(number, '');
  }

  disableChangeMethod = () => {
    this.setState({disableChangeMethod: true});
  }

  enableChangeMethod = () => {
    this.setState({disableChangeMethod: false});
  }

  //
  // State
  //

  finalize = () => {
    const { number, setFinalized } = this.props;
    setFinalized(number, true);
  }

  reset = (resetBIP32Path) => {
    const { number, setExtendedPublicKey, setFinalized } = this.props;
    setExtendedPublicKey(number, '');
    setFinalized(number, false);
    if (resetBIP32Path) {this.resetBIP32Path();}
  }

  //
  // Position
  //

  moveUp = (event) => {
    const {moveUp, number} = this.props;
    event.preventDefault();
    moveUp(number);
  }

  moveDown = (event) => {
    const {moveDown, number} = this.props;
    event.preventDefault();
    moveDown(number);
  }

  //
  // BIP32 Path
  //

  renderBIP32Path = () => {
    const { extendedPublicKeyImporter } = this.props;
    if (extendedPublicKeyImporter.method === TEXT) {
      return (
        <div className="mt-4">
          <p>Make sure you <strong>record the corresponding BIP32 path.</strong></p>
        </div>
      );
    } else {
      return (
        <div className="mt-4">
          <p>The BIP32 path for this extended public key is:</p>
          <div className="text-center">
            <Copyable text={extendedPublicKeyImporter.bip32Path}>
              <code>{extendedPublicKeyImporter.bip32Path}</code>
            </Copyable>
          </div>
          <p className="mt-4">You will need this BIP32 path to sign for this key later.  <strong>Write down this BIP32 path!</strong></p>
        </div>
      );
    }
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

  resetBIP32Path = () => {
    const {number, resetBIP32Path} = this.props;
    resetBIP32Path(number);
  }

  //
  // Extended Public Key
  //


  renderExtendedPublicKey = () => {
    const { extendedPublicKeyImporter } = this.props;
    return (
      <div>
        <p>The following extended public key was imported:</p>
        <div className="text-center">
          <Copyable text={extendedPublicKeyImporter.extendedPublicKey}>
            <small><code>{extendedPublicKeyImporter.extendedPublicKey}</code></small>
          </Copyable>
        </div>
        {this.renderBIP32Path()}
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => {this.reset(extendedPublicKeyImporter.method === HERMIT);}}
        >
          Remove Extended Public Key
        </Button>
      </div>
    );
  }

  validateAndSetExtendedPublicKey = (extendedPublicKey, errback, callback) => {
    const {number, network, extendedPublicKeyImporters, setExtendedPublicKey} = this.props;
    const error = validateExtendedPublicKey(extendedPublicKey, network);
    setExtendedPublicKey(number, extendedPublicKey);
    if (error) {
      errback(error);
    } else {
      if (extendedPublicKey && Object.values(extendedPublicKeyImporters).find((extendedPublicKeyImporter, extendedPublicKeyImporterIndex) => (
        extendedPublicKeyImporterIndex !== (number - 1) && extendedPublicKeyImporter.extendedPublicKey === extendedPublicKey
      ))) {
        errback('This extended public key has already been imported.');
      } else {
        errback('');
        this.finalize();
        callback && callback();
      }
    }
  }

}


function mapStateToProps(state, ownProps) {
  return {
    ...state.settings,
    ...state.quorum,
    ...{ extendedPublicKeyImporter: state.quorum.extendedPublicKeyImporters[ownProps.number] },
  };
}

const mapDispatchToProps = {
  setName: setExtendedPublicKeyImporterName,
  resetBIP32Path: resetExtendedPublicKeyImporterBIP32Path,
  setBIP32Path: setExtendedPublicKeyImporterBIP32Path,
  setMethod: setExtendedPublicKeyImporterMethod,
  setExtendedPublicKey: setExtendedPublicKeyImporterExtendedPublicKey,
  setFinalized: setExtendedPublicKeyImporterFinalized,
};

export default connect(mapStateToProps, mapDispatchToProps,)(ExtendedPublicKeyImporter);
