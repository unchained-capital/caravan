import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { validateBIP32Path, validatePublicKey } from "unchained-bitcoin";
import { TREZOR, LEDGER, HERMIT } from "unchained-wallets";

// Components
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Button,
  Grid,
  Box,
} from "@material-ui/core";
import { ArrowUpward, ArrowDownward } from "@material-ui/icons";

import Copyable from "../Copyable";
import TextPublicKeyImporter from "./TextPublicKeyImporter";
import ExtendedPublicKeyPublicKeyImporter from "./ExtendedPublicKeyPublicKeyImporter";
import HermitPublicKeyImporter from "./HermitPublicKeyImporter";
import HardwareWalletPublicKeyImporter from "./HardwareWalletPublicKeyImporter";
import EditableName from "../EditableName";
import Conflict from "./Conflict";

// Actions
import {
  setPublicKeyImporterName,
  setPublicKeyImporterBIP32Path,
  resetPublicKeyImporterBIP32Path,
  setPublicKeyImporterMethod,
  setPublicKeyImporterPublicKey,
  setPublicKeyImporterFinalized,
  movePublicKeyImporterUp,
  movePublicKeyImporterDown,
} from "../../actions/publicKeyImporterActions";

const XPUB = "xpub";
const TEXT = "text";

class PublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      disableChangeMethod: false,
    };
  }

  title = () => {
    const { number, totalSigners, publicKeyImporter, setName } = this.props;
    return (
      <Grid container justify="space-between">
        <Grid item>
          <EditableName
            number={number}
            name={publicKeyImporter.name}
            setName={setName}
          />
        </Grid>
        <Grid item>
          <Grid container justify="flex-end">
            <Button
              type="button"
              variant="contained"
              onClick={this.moveUp}
              disabled={number === 1}
            >
              <ArrowUpward />
            </Button>
            <span>&nbsp;</span>
            <Button
              type="button"
              variant="contained"
              onClick={this.moveDown}
              disabled={number === totalSigners}
            >
              <ArrowDownward />
            </Button>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  renderImport = () => {
    const { publicKeyImporter, number } = this.props;
    const { disableChangeMethod } = this.state;
    const labelId = `public-key-${number}-importer-select-label`;
    return (
      <div>
        <FormControl fullWidth>
          <InputLabel id={labelId}>Select Method</InputLabel>

          <Select
            labelId={labelId}
            id={`public-key-${number}-importer-select`}
            disabled={disableChangeMethod}
            value={publicKeyImporter.method}
            onChange={this.handleMethodChange}
          >
            <MenuItem value="">{"< Select method >"}</MenuItem>
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
  };

  renderImportByMethod = () => {
    const {
      publicKeyImporter,
      network,
      addressType,
      defaultBIP32Path,
    } = this.props;
    if (
      publicKeyImporter.method === TREZOR ||
      publicKeyImporter.method === LEDGER
    ) {
      return (
        <HardwareWalletPublicKeyImporter
          publicKeyImporter={publicKeyImporter}
          validateAndSetPublicKey={this.validateAndSetPublicKey}
          validateAndSetBIP32Path={this.validateAndSetBIP32Path}
          resetBIP32Path={this.resetBIP32Path}
          enableChangeMethod={this.enableChangeMethod}
          disableChangeMethod={this.disableChangeMethod}
          addressType={addressType}
          defaultBIP32Path={defaultBIP32Path}
          network={network}
        />
      );
    }
    if (publicKeyImporter.method === HERMIT) {
      return (
        <HermitPublicKeyImporter
          publicKeyImporter={publicKeyImporter}
          validateAndSetPublicKey={this.validateAndSetPublicKey}
          validateAndSetBIP32Path={this.validateAndSetBIP32Path}
          resetBIP32Path={this.resetBIP32Path}
          enableChangeMethod={this.enableChangeMethod}
          disableChangeMethod={this.disableChangeMethod}
          reset={this.reset}
        />
      );
    }
    if (publicKeyImporter.method === XPUB) {
      return (
        <ExtendedPublicKeyPublicKeyImporter
          network={network}
          publicKeyImporter={publicKeyImporter}
          validateAndSetPublicKey={this.validateAndSetPublicKey}
          validateAndSetBIP32Path={this.validateAndSetBIP32Path}
        />
      );
    }
    if (publicKeyImporter.method === TEXT) {
      return (
        <TextPublicKeyImporter
          publicKeyImporter={publicKeyImporter}
          validateAndSetPublicKey={this.validateAndSetPublicKey}
        />
      );
    }
    return null;
  };

  //
  // Method
  //

  handleMethodChange = (event) => {
    const { number, setMethod, setPublicKey } = this.props;
    setMethod(number, event.target.value);
    setPublicKey(number, "");
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

  finalize = () => {
    const { number, setFinalized } = this.props;
    setFinalized(number, true);
  };

  reset = (resetBIP32Path) => {
    const { number, setPublicKey, setFinalized } = this.props;
    setPublicKey(number, "");
    setFinalized(number, false);
    if (resetBIP32Path) {
      this.resetBIP32Path();
    }
  };

  //
  // Position
  //

  moveUp = (event) => {
    const { moveUp, number } = this.props;
    event.preventDefault();
    moveUp(number);
  };

  moveDown = (event) => {
    const { moveDown, number } = this.props;
    event.preventDefault();
    moveDown(number);
  };

  //
  // BIP32 Path
  //

  renderBIP32Path = () => {
    const { publicKeyImporter } = this.props;
    if (publicKeyImporter.method !== TEXT) {
      return (
        <Box mt={4}>
          <p>The BIP32 path for this public key is:</p>
          <Grid container justify="center">
            <Copyable text={publicKeyImporter.bip32Path} code />
          </Grid>
          <Box mt={4}>
            <p>
              You will need this BIP32 path to sign for this key later.{" "}
              <strong>Write down this BIP32 path!</strong>
            </p>
          </Box>
        </Box>
      );
    }
    return null;
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

  resetBIP32Path = () => {
    const { number, resetBIP32Path } = this.props;
    resetBIP32Path(number);
  };

  //
  // Public Key
  //

  renderPublicKey = () => {
    const { publicKeyImporter } = this.props;
    return (
      <div>
        <p>The following public key was imported:</p>
        <Grid container justify="center">
          <Copyable text={publicKeyImporter.publicKey} showIcon code />
        </Grid>
        {this.renderBIP32Path()}
        <Box mt={2}>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => {
              this.reset(publicKeyImporter.method === HERMIT);
            }}
          >
            Remove Public Key
          </Button>
        </Box>
      </div>
    );
  };

  validateAndSetPublicKey = (publicKey, errback, callback) => {
    const { number, publicKeyImporters, setPublicKey } = this.props;
    const error = validatePublicKey(publicKey);
    setPublicKey(number, publicKey);
    if (error) {
      if (errback) errback(error);
    } else if (
      publicKey &&
      Object.values(publicKeyImporters).find(
        (publicKeyImporter, publicKeyImporterIndex) =>
          publicKeyImporterIndex !== number - 1 &&
          publicKeyImporter.publicKey === publicKey
      )
    ) {
      if (errback) errback("This public key has already been imported.");
    } else {
      if (errback) errback("");
      this.finalize();
      if (callback) callback();
    }
  };

  render() {
    const { publicKeyImporter } = this.props;
    return (
      <Card>
        <CardHeader title={this.title()} />
        <CardContent>
          {publicKeyImporter.method &&
            publicKeyImporter.method !== TEXT &&
            publicKeyImporter.conflict && (
              <Conflict message="Warning, BIP32 path is in conflict with the network and address type settings.  Do not proceed unless you are absolutely sure you know what you are doing!" />
            )}
          {publicKeyImporter.finalized
            ? this.renderPublicKey()
            : this.renderImport()}
        </CardContent>
      </Card>
    );
  }
}

PublicKeyImporter.propTypes = {
  network: PropTypes.string.isRequired,
  totalSigners: PropTypes.number.isRequired,
  number: PropTypes.number.isRequired,
  publicKeyImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
    conflict: PropTypes.bool,
    finalized: PropTypes.bool,
    method: PropTypes.string,
    name: PropTypes.string,
    publicKey: PropTypes.string,
  }).isRequired,
  publicKeyImporters: PropTypes.shape({}).isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  addressType: PropTypes.string.isRequired,
  setName: PropTypes.func.isRequired,
  setBIP32Path: PropTypes.func.isRequired,
  setMethod: PropTypes.func.isRequired,
  setPublicKey: PropTypes.func.isRequired,
  setFinalized: PropTypes.func.isRequired,
  moveUp: PropTypes.func.isRequired,
  moveDown: PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    ...state.settings,
    ...state.address,
    ...{ publicKeyImporter: state.address.publicKeyImporters[ownProps.number] },
  };
}

const mapDispatchToProps = {
  setName: setPublicKeyImporterName,
  setBIP32Path: setPublicKeyImporterBIP32Path,
  resetBIP32Path: resetPublicKeyImporterBIP32Path,
  setMethod: setPublicKeyImporterMethod,
  setPublicKey: setPublicKeyImporterPublicKey,
  setFinalized: setPublicKeyImporterFinalized,
  moveUp: movePublicKeyImporterUp,
  moveDown: movePublicKeyImporterDown,
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicKeyImporter);
