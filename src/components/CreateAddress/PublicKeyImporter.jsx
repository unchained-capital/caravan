import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { validatePublicKey as baseValidatePublicKey } from "unchained-bitcoin";
import { TREZOR, LEDGER } from "unchained-wallets";

// Components
import {
  Card,
  CardHeader,
  CardContent,
  FormControl,
  MenuItem,
  Button,
  Grid,
  Box,
  TextField,
} from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

import Copyable from "../Copyable";
import TextPublicKeyImporter from "./TextPublicKeyImporter";
import ExtendedPublicKeyPublicKeyImporter from "./ExtendedPublicKeyPublicKeyImporter";
import HardwareWalletPublicKeyImporter from "./HardwareWalletPublicKeyImporter";
import EditableName from "../EditableName";
import Conflict from "./Conflict";

// Actions
import {
  setPublicKeyImporterName,
  setPublicKeyImporterBIP32Path,
  setPublicKeyImporterMethod,
  setPublicKeyImporterPublicKey,
  setPublicKeyImporterFinalized,
  movePublicKeyImporterUp,
  movePublicKeyImporterDown,
} from "../../actions/publicKeyImporterActions";

const XPUB = "xpub";
const TEXT = "text";

const PublicKeyImporter = ({
  publicKeyImporter,
  publicKeyImporters,
  number,
  setFinalized,
  addressType,
  totalSigners,
  setName,
  network,
  defaultBIP32Path,
  setMethod,
  setPublicKey,
  moveUp,
  moveDown,
  setBIP32Path,
}) => {
  const [disableChangeMethod, setDisableChangeMethod] = useState(false);

  //
  // Method
  //

  const handleMethodChange = (event) => {
    setMethod(number, event.target.value);
    setPublicKey(number, "");
  };

  //
  // State
  //

  const finalize = () => {
    setFinalized(number, true);
  };

  const reset = () => {
    setPublicKey(number, "");
    setFinalized(number, false);
  };

  //
  // Position
  //

  const handleMoveUp = (event) => {
    event.preventDefault();
    moveUp(number);
  };

  const handleMoveDown = (event) => {
    event.preventDefault();
    moveDown(number);
  };

  //
  // BIP32 Path
  //

  const renderBIP32Path = () => {
    if (publicKeyImporter.method !== TEXT) {
      return (
        <Box mt={4}>
          <p>The BIP32 path for this public key is:</p>
          <Grid container justifyContent="center">
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

  //
  // Public Key
  //

  const renderPublicKey = () => {
    return (
      <div>
        <p>The following public key was imported:</p>
        <Grid container justifyContent="center">
          <Copyable text={publicKeyImporter.publicKey} showIcon code />
        </Grid>
        {renderBIP32Path()}
        <Box mt={2}>
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={() => {
              reset();
            }}
          >
            Remove Public Key
          </Button>
        </Box>
      </div>
    );
  };

  const handleImport = ({ bip32Path, publicKey }) => {
    // bip32Path is not present in the TEXT input method.
    if (bip32Path) {
      setBIP32Path(number, bip32Path);
    }
    setPublicKey(number, publicKey);
    finalize();
  };

  const validatePublicKey = (publicKey) => {
    const publicKeyError = baseValidatePublicKey(publicKey, addressType);
    if (publicKeyError) {
      return publicKeyError;
    }

    const duplicateError =
      publicKey &&
      Object.values(publicKeyImporters).find(
        (publicKeyImp, publicKeyImporterIndex) =>
          publicKeyImporterIndex !== number - 1 &&
          publicKeyImp.publicKey === publicKey
      )
        ? "This public key has already been imported."
        : null;
    if (duplicateError) {
      return duplicateError;
    }

    return "";
  };

  const title = () => {
    return (
      <Grid container justifyContent="space-between">
        <Grid item>
          <EditableName
            number={number}
            name={publicKeyImporter.name}
            setName={setName}
          />
        </Grid>
        <Grid item>
          <Grid container justifyContent="flex-end">
            <Button
              type="button"
              variant="contained"
              onClick={handleMoveUp}
              disabled={number === 1}
            >
              <ArrowUpward />
            </Button>
            <span>&nbsp;</span>
            <Button
              type="button"
              variant="contained"
              onClick={handleMoveDown}
              disabled={number === totalSigners}
            >
              <ArrowDownward />
            </Button>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const renderImportByMethod = () => {
    if (
      publicKeyImporter.method === TREZOR ||
      publicKeyImporter.method === LEDGER
    ) {
      return (
        <HardwareWalletPublicKeyImporter
          method={publicKeyImporter.method}
          validatePublicKey={validatePublicKey}
          enableChangeMethod={() => setDisableChangeMethod(false)}
          disableChangeMethod={() => setDisableChangeMethod(true)}
          defaultBIP32Path={defaultBIP32Path}
          network={network}
          onImport={handleImport}
        />
      );
    }
    if (publicKeyImporter.method === XPUB) {
      return (
        <ExtendedPublicKeyPublicKeyImporter
          network={network}
          validatePublicKey={validatePublicKey}
          onImport={handleImport}
        />
      );
    }
    if (publicKeyImporter.method === TEXT) {
      return (
        <TextPublicKeyImporter
          validatePublicKey={validatePublicKey}
          onImport={handleImport}
        />
      );
    }
    return null;
  };
  const renderImport = () => {
    return (
      <div>
        <FormControl fullWidth>
          <TextField
            label="Select Method"
            id={`public-key-${number}-importer-select`}
            disabled={disableChangeMethod}
            value={publicKeyImporter.method}
            onChange={handleMethodChange}
            select
            variant="standard"
          >
            <MenuItem value="">{"< Select method >"}</MenuItem>
            <MenuItem value={TREZOR}>Trezor</MenuItem>
            <MenuItem value={LEDGER}>Ledger</MenuItem>
            <MenuItem value={XPUB}>Derive from extended public key</MenuItem>
            <MenuItem value={TEXT}>Enter as text</MenuItem>
          </TextField>
        </FormControl>

        {renderImportByMethod()}
      </div>
    );
  };

  useEffect(() => {
    if (validatePublicKey(publicKeyImporter.publicKey)) {
      setFinalized(number, false);
    }
  }, [addressType]);

  const publicKeyError = validatePublicKey(publicKeyImporter.publicKey);
  return (
    <Card>
      <CardHeader title={title()} />
      <CardContent>
        {publicKeyImporter.method &&
          publicKeyImporter.method !== TEXT &&
          publicKeyImporter.conflict && (
            <Conflict message="Warning, BIP32 path is in conflict with the network and address type settings.  Do not proceed unless you are absolutely sure you know what you are doing!" />
          )}
        {publicKeyError.includes(
          "does not support uncompressed public keys"
        ) && <Conflict message={publicKeyError} />}
        {publicKeyImporter.finalized ? renderPublicKey() : renderImport()}
      </CardContent>
    </Card>
  );
};

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
  setMethod: setPublicKeyImporterMethod,
  setPublicKey: setPublicKeyImporterPublicKey,
  setFinalized: setPublicKeyImporterFinalized,
  moveUp: movePublicKeyImporterUp,
  moveDown: movePublicKeyImporterDown,
};

export default connect(mapStateToProps, mapDispatchToProps)(PublicKeyImporter);
