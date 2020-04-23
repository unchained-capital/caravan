import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  validateBIP32Path,
  convertExtendedPublicKey,
  validateExtendedPublicKey,
  NETWORKS,
} from "unchained-bitcoin";
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
  FormHelperText,
  Box,
  withStyles,
} from "@material-ui/core";
import Copyable from "../Copyable";
import ExtendedPublicKeyExtendedPublicKeyImporter from "./ExtendedPublicKeyExtendedPublicKeyImporter";
import TextExtendedPublicKeyImporter from "./TextExtendedPublicKeyImporter";
import HermitExtendedPublicKeyImporter from "./HermitExtendedPublicKeyImporter";
import HardwareWalletExtendedPublicKeyImporter from "./HardwareWalletExtendedPublicKeyImporter";
import EditableName from "../EditableName";
import Conflict from "../CreateAddress/Conflict";

// Actions
import {
  setExtendedPublicKeyImporterName,
  resetExtendedPublicKeyImporterBIP32Path,
  setExtendedPublicKeyImporterBIP32Path,
  setExtendedPublicKeyImporterMethod,
  setExtendedPublicKeyImporterExtendedPublicKey,
  setExtendedPublicKeyImporterFinalized,
} from "../../actions/extendedPublicKeyImporterActions";

const XPUB = "xpub";
const TEXT = "text";

const useStyles = () => ({
  xpub: {
    lineHeight: ".8rem",
    overflowWrap: "break-word",
  },
});

class ExtendedPublicKeyImporter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      disableChangeMethod: false,
      conversionMessage: "",
    };
  }

  title = () => {
    const { number, extendedPublicKeyImporter, setName } = this.props;
    return (
      <EditableName
        number={number}
        name={extendedPublicKeyImporter.name}
        setName={setName}
      />
    );
  };

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
      extendedPublicKeyImporters,
      extendedPublicKeyImporter,
      network,
      addressType,
      defaultBIP32Path,
    } = this.props;
    if (
      extendedPublicKeyImporter.method === TREZOR ||
      extendedPublicKeyImporter.method === LEDGER
    ) {
      return (
        <HardwareWalletExtendedPublicKeyImporter
          extendedPublicKeyImporter={extendedPublicKeyImporter}
          validateAndSetExtendedPublicKey={this.validateAndSetExtendedPublicKey}
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
    if (extendedPublicKeyImporter.method === HERMIT) {
      return (
        <HermitExtendedPublicKeyImporter
          extendedPublicKeyImporter={extendedPublicKeyImporter}
          validateAndSetExtendedPublicKey={this.validateAndSetExtendedPublicKey}
          validateAndSetBIP32Path={this.validateAndSetBIP32Path}
          enableChangeMethod={this.enableChangeMethod}
          disableChangeMethod={this.disableChangeMethod}
          resetBIP32Path={this.resetBIP32Path}
          reset={this.reset}
        />
      );
    }
    if (extendedPublicKeyImporter.method === XPUB) {
      return (
        <ExtendedPublicKeyExtendedPublicKeyImporter
          extendedPublicKeyImporter={extendedPublicKeyImporter}
          extendedPublicKeyImporters={extendedPublicKeyImporters}
          validateAndSetExtendedPublicKey={this.validateAndSetExtendedPublicKey}
          network={network}
          validateAndSetBIP32Path={this.validateAndSetBIP32Path}
        />
      );
    }
    if (extendedPublicKeyImporter.method === TEXT) {
      return (
        <TextExtendedPublicKeyImporter
          extendedPublicKeyImporter={extendedPublicKeyImporter}
          validateAndSetExtendedPublicKey={this.validateAndSetExtendedPublicKey}
        />
      );
    }
    return null;
  };

  //
  // Method
  //

  handleMethodChange = (event) => {
    const { number, setMethod, setExtendedPublicKey } = this.props;
    setMethod(number, event.target.value);
    setExtendedPublicKey(number, "");
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
    const { number, setExtendedPublicKey, setFinalized } = this.props;
    setExtendedPublicKey(number, "");
    setFinalized(number, false);
    if (resetBIP32Path) {
      this.resetBIP32Path();
    }
  };

  //
  // BIP32 Path
  //

  renderBIP32Path = () => {
    const { extendedPublicKeyImporter } = this.props;
    if (extendedPublicKeyImporter.method === TEXT) {
      return (
        <div className="mt-4">
          <p>
            Make sure you <strong>record the corresponding BIP32 path.</strong>
          </p>
        </div>
      );
    }
    return (
      <div className="mt-4">
        <p>The BIP32 path for this extended public key is:</p>
        <div className="text-center">
          <Copyable text={extendedPublicKeyImporter.bip32Path} showIcon />
        </div>
        <p className="mt-4">
          You will need this BIP32 path to sign for this key later.{" "}
          <strong>Write down this BIP32 path!</strong>
        </p>
      </div>
    );
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
  // Extended Public Key
  //

  renderExtendedPublicKey = () => {
    const { extendedPublicKeyImporter, network, classes } = this.props;
    const { conversionMessage } = this.state;
    const conversionAppend =
      extendedPublicKeyImporter.method === HERMIT &&
      network === NETWORKS.TESTNET
        ? "this should not be an issue as hermit signing is not affected by the conversion."
        : "this may indicate an invalid network setting, if so correct setting, remove key and try again.";
    return (
      <div>
        <p>The following extended public key was imported:</p>
        <div className={classes.xpub}>
          <Copyable
            text={extendedPublicKeyImporter.extendedPublicKey}
            showIcon
          />
        </div>
        {this.renderBIP32Path()}
        {conversionMessage !== "" && (
          <Box mb={2}>
            <FormHelperText>
              {conversionMessage}, {conversionAppend}{" "}
            </FormHelperText>
          </Box>
        )}
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={() => {
            this.reset(extendedPublicKeyImporter.method === HERMIT);
          }}
        >
          Remove Extended Public Key
        </Button>
      </div>
    );
  };

  validateAndSetExtendedPublicKey = (extendedPublicKey, errback, callback) => {
    const {
      number,
      network,
      extendedPublicKeyImporters,
      setExtendedPublicKey,
    } = this.props;
    const networkError = validateExtendedPublicKey(extendedPublicKey, network);
    let actualExtendedPublicKey = extendedPublicKey;
    if (networkError !== "") {
      try {
        actualExtendedPublicKey = convertExtendedPublicKey(
          extendedPublicKey,
          network === "testnet" ? "tpub" : "xpub"
        );
      } catch (error) {
        errback(error.message);
        setExtendedPublicKey(number, extendedPublicKey);
        return;
      }
    }

    const validationError = validateExtendedPublicKey(
      actualExtendedPublicKey,
      network
    );
    if (validationError !== "") {
      errback(validationError);
      setExtendedPublicKey(number, extendedPublicKey);
      return;
    }
    setExtendedPublicKey(number, actualExtendedPublicKey);

    if (
      actualExtendedPublicKey &&
      Object.values(extendedPublicKeyImporters).find(
        (extendedPublicKeyImporter, extendedPublicKeyImporterIndex) =>
          extendedPublicKeyImporterIndex !== number - 1 &&
          extendedPublicKeyImporter.extendedPublicKey ===
            actualExtendedPublicKey
      )
    ) {
      errback("This extended public key has already been imported.");
    } else {
      errback("");
      const conversionMessage =
        actualExtendedPublicKey === extendedPublicKey
          ? ""
          : `Your extended public key has been converted from ${extendedPublicKey.slice(
              0,
              4
            )} to ${actualExtendedPublicKey.slice(0, 4)}`;
      this.setState({ conversionMessage });
      this.finalize();

      if (callback) {
        callback();
      }
    }
  };

  render() {
    const { extendedPublicKeyImporter, finalizedNetwork, network } = this.props;
    const hasConflict =
      extendedPublicKeyImporter.method /* && extendedPublicKeyImporter.method !== TEXT */ &&
      extendedPublicKeyImporter.conflict;
    let conflictMessage = "";
    if (hasConflict) {
      if (finalizedNetwork !== network) {
        conflictMessage =
          "Warning, you can not mix xpub and tpub.  Do not proceed without resolving by either removing conflicting imported keys or returning network type to original state!";
      } else {
        conflictMessage =
          "Warning, BIP32 path is in conflict with the network and address type settings.  Do not proceed unless you are absolutely sure you know what you are doing!";
      }
    }
    return (
      <Card>
        <CardHeader title={this.title()} />
        <CardContent>
          {hasConflict && <Conflict message={conflictMessage} />}
          {extendedPublicKeyImporter.finalized
            ? this.renderExtendedPublicKey()
            : this.renderImport()}
        </CardContent>
      </Card>
    );
  }
}

ExtendedPublicKeyImporter.propTypes = {
  addressType: PropTypes.string.isRequired,
  classes: PropTypes.shape({
    xpub: PropTypes.string,
  }).isRequired,
  defaultBIP32Path: PropTypes.string.isRequired,
  extendedPublicKeyImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
    conflict: PropTypes.bool,
    extendedPublicKey: PropTypes.string,
    finalized: PropTypes.bool,
    name: PropTypes.string,
    method: PropTypes.string,
  }).isRequired,
  extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
  finalizedNetwork: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  setBIP32Path: PropTypes.func.isRequired,
  setExtendedPublicKey: PropTypes.func.isRequired,
  setFinalized: PropTypes.func.isRequired,
  setName: PropTypes.func.isRequired,
  setMethod: PropTypes.func.isRequired,
};

function mapStateToProps(state, ownProps) {
  return {
    ...state.settings,
    ...state.quorum,
    ...{
      extendedPublicKeyImporter:
        state.quorum.extendedPublicKeyImporters[ownProps.number],
    },
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

const ExtendedPublicKeyImporterWithStyles = withStyles(useStyles)(
  ExtendedPublicKeyImporter
);

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExtendedPublicKeyImporterWithStyles);
