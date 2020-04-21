import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { validatePublicKey, validateBIP32Path } from "unchained-bitcoin";
import { TREZOR, LEDGER, HERMIT } from "unchained-wallets";

// Components
import CheckIcon from "@material-ui/icons/Check";
import ClearIcon from "@material-ui/icons/Clear";
import { styled } from "@material-ui/core/styles";
import {
  Card,
  CardHeader,
  CardContent,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import HardwareWalletPublicKeyImporter from "../CreateAddress/HardwareWalletPublicKeyImporter";
import HermitPublicKeyImporter from "../CreateAddress/HermitPublicKeyImporter";

// Actions
import {
  resetPublicKeyImporter,
  resetPublicKeyImporterBIP32Path,
  setPublicKeyImporterBIP32Path,
  setPublicKeyImporterMethod,
  setPublicKeyImporterPublicKey,
} from "../../actions/ownershipActions";

import "react-table/react-table.css";

class ConfirmOwnership extends React.Component {
  titleRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      disableChangeMethod: false,
    };
  }

  componentDidMount = () => {
    this.resetBIP32Path();
    this.scrollToTitle();
  };

  componentDidUpdate = () => {
    this.scrollToTitle();
  };

  scrollToTitle = () => {
    this.titleRef.current.scrollIntoView({ behavior: "smooth" });
  };

  //
  // Method
  //

  handleMethodChange = (event) => {
    const { setMethod } = this.props;
    setMethod(event.target.value);
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
    const { reset } = this.props;
    reset();
  };

  //
  // BIP32 Path
  //

  resetBIP32Path = () => {
    const { resetBIP32Path } = this.props;
    resetBIP32Path();
  };

  validateAndSetBIP32Path = (bip32Path, callback, errback, options) => {
    const { setBIP32Path } = this.props;
    const error = validateBIP32Path(bip32Path, options);
    setBIP32Path(bip32Path);
    if (error) {
      errback(error);
    } else {
      errback("");
      callback();
    }
  };

  //
  // Public Keey & Confirmation
  //

  validateAndSetPublicKey = (publicKey, errback, callback) => {
    const { setPublicKey } = this.props;
    const error = validatePublicKey(publicKey);
    setPublicKey(publicKey);
    if (error) {
      if (errback) errback(error);
    } else {
      if (errback) errback("");
      if (callback) callback();
    }
  };

  renderConfirmation = () => {
    const { publicKeys, publicKeyImporter } = this.props;
    if (publicKeyImporter.publicKey === "") {
      return null;
    }
    if (publicKeys.includes(publicKeyImporter.publicKey)) {
      const GreenListItemIcon = styled(ListItemIcon)({ color: "green" });
      return (
        <List>
          <ListItem>
            <GreenListItemIcon>
              <CheckIcon />
            </GreenListItemIcon>
            <ListItemText>
              The public key exported at BIP32 path{" "}
              <code>{publicKeyImporter.bip32Path}</code> is present in the
              provided redeem script.
            </ListItemText>
          </ListItem>
        </List>
      );
    }
    return (
      <List>
        <ListItem>
          <ListItemIcon>
            <Typography color="error">
              <ClearIcon />
            </Typography>
          </ListItemIcon>
          <ListItemText>
            The public key exported at BIP32 path{" "}
            <code>{publicKeyImporter.bip32Path}</code> is not present in the
            provided redeem script.
          </ListItemText>
        </ListItem>
      </List>
    );
  };

  renderImportByMethod = () => {
    const { network, publicKeyImporter, defaultBIP32Path } = this.props;
    if (publicKeyImporter.method === HERMIT) {
      return (
        <HermitPublicKeyImporter
          publicKeyImporter={publicKeyImporter}
          validateAndSetBIP32Path={this.validateAndSetBIP32Path}
          validateAndSetPublicKey={this.validateAndSetPublicKey}
          resetBIP32Path={this.resetBIP32Path}
          enableChangeMethod={this.enableChangeMethod}
          disableChangeMethod={this.disableChangeMethod}
          reset={this.reset}
        />
      );
    }
    if (
      publicKeyImporter.method === TREZOR ||
      publicKeyImporter.method === LEDGER
    ) {
      return (
        <HardwareWalletPublicKeyImporter
          network={network}
          publicKeyImporter={publicKeyImporter}
          validateAndSetBIP32Path={this.validateAndSetBIP32Path}
          resetBIP32Path={this.resetBIP32Path}
          defaultBIP32Path={defaultBIP32Path}
          validateAndSetPublicKey={this.validateAndSetPublicKey}
          enableChangeMethod={this.enableChangeMethod}
          disableChangeMethod={this.disableChangeMethod}
        />
      );
    }
    return null;
  };

  render() {
    const { publicKeyImporter } = this.props;
    const { disableChangeMethod } = this.state;
    const labelId = "public-key-importer-select-label";
    const selectLabelId = `${labelId}-select`;

    return (
      <Card>
        <CardHeader ref={this.titleRef} title="Confirm Ownership" />
        <CardContent>
          <form>
            <p>How will you confirm your ownership of this address?</p>

            <FormControl fullWidth>
              <InputLabel id={labelId}>Select Method</InputLabel>

              <Select
                labelId={selectLabelId}
                id="public-key-importer-select"
                disabled={disableChangeMethod}
                value={publicKeyImporter.method}
                onChange={this.handleMethodChange}
              >
                <MenuItem value="">{"< Select method >"}</MenuItem>
                <MenuItem value={TREZOR}>Trezor</MenuItem>
                <MenuItem value={LEDGER}>Ledger</MenuItem>
                <MenuItem value={HERMIT}>Hermit</MenuItem>
              </Select>
            </FormControl>

            {this.renderImportByMethod()}

            {this.renderConfirmation()}

            {publicKeyImporter.method !== "" && (
              <Button
                variant="contained"
                size="small"
                color="secondary"
                role="button"
                onClick={this.reset}
              >
                Start Again
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    );
  }
}

ConfirmOwnership.propTypes = {
  defaultBIP32Path: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
  publicKeys: PropTypes.arrayOf(PropTypes.string).isRequired,
  publicKeyImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
    method: PropTypes.string,
    publicKey: PropTypes.string,
  }).isRequired,
  reset: PropTypes.func.isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  setMethod: PropTypes.func.isRequired,
  setPublicKey: PropTypes.func.isRequired,
  setBIP32Path: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return state.spend.ownership;
}

const mapDispatchToProps = {
  setMethod: setPublicKeyImporterMethod,
  setBIP32Path: setPublicKeyImporterBIP32Path,
  setPublicKey: setPublicKeyImporterPublicKey,
  resetBIP32Path: resetPublicKeyImporterBIP32Path,
  reset: resetPublicKeyImporter,
};

export default connect(mapStateToProps, mapDispatchToProps)(ConfirmOwnership);
