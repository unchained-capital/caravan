import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

// Actions
import { deriveChildPublicKey } from "unchained-bitcoin";
import { Box, FormControl, MenuItem, TextField } from "@mui/material";
import {
  setSignatureImporterBIP32Path,
  setSignatureImporterMethod,
} from "../../actions/signatureImporterActions";

import { setSigningKey as setSigningKeyAction } from "../../actions/transactionActions";

// Components
import SignatureImporter from "../ScriptExplorer/SignatureImporter";

class ExtendedPublicKeySelector extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selection: "",
    };
  }

  componentDidMount = () => {
    const { signingKeys, number } = this.props;
    if (signingKeys[number - 1] > 0)
      this.updateKeySelection(signingKeys[number - 1]);
  };

  // There can be a situation where a signatureImporter is in the finalized
  // state, but it was never actually selected as a key. This can
  // happen when a signed PSBT is uploaded that has more than one set of
  // signatures, given all of the assumptions around transaction signing flow
  // and signature validation
  render = () => {
    const { selection } = this.state;
    const { number, signatureImporter } = this.props;
    return (
      <div>
        {this.renderKeySelectorMenu()}
        {((selection > 0 && number > 0) ||
          (signatureImporter && signatureImporter.finalized)) &&
          this.renderSignatureImporter()}
      </div>
    );
  };

  renderSignatureImporter = () => {
    const { number } = this.props;
    const extendedPublicKeyImporter =
      this.getAssociatedExtendedPublicKeyImporter();
    return (
      <Box mt={2}>
        <SignatureImporter
          number={number}
          extendedPublicKeyImporter={extendedPublicKeyImporter}
        />
      </Box>
    );
  };

  getAssociatedExtendedPublicKeyImporter = () => {
    const { extendedPublicKeyImporters } = this.props;
    const { selection } = this.state;
    let associatedExtendedPublicKeyImporter = null;

    if (selection) {
      associatedExtendedPublicKeyImporter =
        extendedPublicKeyImporters[selection];
    }

    return associatedExtendedPublicKeyImporter;
  };

  renderKeySelectorMenu = () => {
    const { number, signatureImporters, setBIP32Path } = this.props;
    const { selection } = this.state;

    const extendedPublicKeyImporter =
      this.getAssociatedExtendedPublicKeyImporter();
    if (extendedPublicKeyImporter !== null && number > 0) {
      const signatureImporter = signatureImporters[number];
      if (signatureImporter.signature.length > 0) return "";

      if (
        extendedPublicKeyImporter.bip32Path !== signatureImporter.bip32Path &&
        extendedPublicKeyImporter.method !== "text"
      ) {
        setTimeout(() => {
          setBIP32Path(number, extendedPublicKeyImporter.bip32Path);
        }, 0);
      }
    }

    return (
      <form>
        <FormControl fullWidth>
          <TextField
            label="Select Key"
            id={`signature-${number}-key-select`}
            select
            value={selection}
            onChange={this.handleKeyChange}
            variant="standard"
          >
            <MenuItem value="">{"< Select Extended Public Key >"}</MenuItem>
            {this.renderKeySelectorMenuItems()}
          </TextField>
        </FormControl>
      </form>
    );
  };

  extendedPublicKeyImporterNotUsed = (extendedPublicKeyImporter) => {
    const { inputs, network, signatureImporters, number } = this.props;
    if (number === 0) return true;

    for (let inputIndex = 0; inputIndex < inputs.length; inputIndex += 1) {
      const input = inputs[inputIndex];
      const derivedKey = deriveChildPublicKey(
        extendedPublicKeyImporter.extendedPublicKey,
        input.bip32Path,
        network
      );
      for (
        let importerIndex = 1;
        importerIndex <= Object.keys(signatureImporters).length;
        importerIndex += 1
      ) {
        const importer = signatureImporters[importerIndex];
        for (
          let publicKeyIndex = 0;
          publicKeyIndex < importer.publicKeys.length;
          publicKeyIndex += 1
        ) {
          const publicKey = importer.publicKeys[publicKeyIndex];
          if (publicKey === derivedKey) return false;
        }
      }
    }
    return true;
  };

  renderKeySelectorMenuItems = () => {
    const { extendedPublicKeyImporters, totalSigners } = this.props;
    const extendedPublicKeys = [];
    for (
      let extendedPublicKeyImporterNum = 1;
      extendedPublicKeyImporterNum <= totalSigners;
      extendedPublicKeyImporterNum += 1
    ) {
      const extendedPublicKeyImporter =
        extendedPublicKeyImporters[extendedPublicKeyImporterNum];
      if (this.extendedPublicKeyImporterNotUsed(extendedPublicKeyImporter)) {
        extendedPublicKeys.push(
          <MenuItem
            value={extendedPublicKeyImporterNum}
            key={extendedPublicKeyImporterNum}
          >
            {extendedPublicKeyImporter.name}
          </MenuItem>
        );
      }
    }
    return extendedPublicKeys;
  };

  handleKeyChange = (event) => {
    const { onChange } = this.props;
    this.updateKeySelection(event.target.value);

    if (onChange) {
      const { extendedPublicKeyImporters } = this.props;

      const importer = extendedPublicKeyImporters[event.target.value];
      onChange(event, importer);
    }
  };

  updateKeySelection(value) {
    this.setState({ selection: value });
    if (value === "") return;

    const { extendedPublicKeyImporters, setMethod, number, setSigningKey } =
      this.props;
    const extendedPublicKeyImporter = extendedPublicKeyImporters[value];
    const importMethod = extendedPublicKeyImporter.method;
    if (importMethod === "text") {
      setMethod(number, ""); // user picks
    } else {
      setMethod(number, importMethod);
    }
    if (number > 0) setSigningKey(number, value);
  }
}

ExtendedPublicKeySelector.propTypes = {
  extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
  inputs: PropTypes.arrayOf(
    PropTypes.shape({
      bip32Path: PropTypes.string,
    })
  ).isRequired,
  onChange: PropTypes.func,
  network: PropTypes.string.isRequired,
  number: PropTypes.number.isRequired,
  setBIP32Path: PropTypes.func.isRequired,
  setMethod: PropTypes.func.isRequired,
  setSigningKey: PropTypes.func.isRequired,
  signatureImporters: PropTypes.shape({}).isRequired,
  signatureImporter: PropTypes.shape({
    finalized: PropTypes.bool,
  }),
  signingKeys: PropTypes.arrayOf(PropTypes.number).isRequired,
  totalSigners: PropTypes.number.isRequired,
};

ExtendedPublicKeySelector.defaultProps = {
  onChange: null,
  signatureImporter: null,
};

function mapStateToProps(state, ownProps) {
  return {
    ...state.quorum,
    totalSigners: state.spend.transaction.totalSigners,
    inputs: state.spend.transaction.inputs,
    network: state.settings.network,
    signatureImporters: state.spend.signatureImporters,
    signatureImporter: state.spend.signatureImporters[ownProps.number],
    signingKeys: state.spend.transaction.signingKeys,
  };
}

const mapDispatchToProps = {
  setBIP32Path: setSignatureImporterBIP32Path,
  setMethod: setSignatureImporterMethod,
  setSigningKey: setSigningKeyAction,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ExtendedPublicKeySelector);
