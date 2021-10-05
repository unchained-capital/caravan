import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  PENDING,
  UNSUPPORTED,
  SignMultisigTransaction,
  KEYSTONE,
} from "unchained-wallets";

// Components
import { Grid, Box, FormHelperText, Button } from "@material-ui/core";

import moment from "moment";
import { connect } from "react-redux";
import InteractionMessages from "../InteractionMessages";
import { KeystonePSBTPlayer, KeystoneReader } from "./index";
import { downloadFile } from "../../utils";

const KeystoneSignatureImporter = (props) => {
  const {
    signatureImporter,
    network,
    inputs,
    outputs,
    walletName,
    validateAndSetSignature,
    resetBIP32Path,
    enableChangeMethod,
    disableChangeMethod,
  } = props;
  const makeInteraction = () => {
    const bip32Paths = inputs.map((input) => {
      if (typeof input.bip32Path === "undefined")
        return signatureImporter.bip32Path; // pubkey path
      return `${signatureImporter.bip32Path}${input.bip32Path.slice(1)}`; // xpub/pubkey slice away the m, keep /
    });

    return SignMultisigTransaction({
      keystore: KEYSTONE,
      network,
      inputs,
      outputs,
      bip32Paths,
    });
  };
  const [signatureError, setSignatureError] = useState("");
  const [status] = useState(
    makeInteraction(true).isSupported ? PENDING : UNSUPPORTED
  );

  const handleDownloadPSBT = () => {
    const body = Buffer.from(makeInteraction().request(), "hex").toString(
      "base64"
    );
    const timestamp = moment().format("HHmm");
    const filename = `${timestamp}-${walletName}.psbt`;
    downloadFile(body, filename);
  };

  const importSignature = (signature) => {
    const signatures = Object.values(signature).reduce((acc, cur) => {
      return acc.concat(cur);
    }, []);
    setSignatureError("");
    enableChangeMethod();
    validateAndSetSignature(signatures, (error) => {
      setSignatureError(error);
    });
  };

  const clear = () => {
    resetBIP32Path();
    setSignatureError("");
    enableChangeMethod();
  };

  const interaction = makeInteraction();
  if (status === UNSUPPORTED) {
    return (
      <InteractionMessages
        messages={interaction.messagesFor({ state: status })}
        excludeCodes={["keystone.signature_request"]}
      />
    );
  }
  return (
    <Box mt={2}>
      <Box mt={2}>
        <Grid container spacing={2}>
          <Grid item>
            <KeystonePSBTPlayer
              data={interaction.request()}
              startText="Show Transaction QRCode"
            />
          </Grid>
          <Grid item>
            <Button onClick={handleDownloadPSBT} variant="outlined">
              Export Transaction
            </Button>
          </Grid>
        </Grid>

        <KeystoneReader
          qrStartText="Scan Signature QR Code"
          fileStartText="Upload Signed PSBT"
          interaction={interaction}
          onStart={disableChangeMethod}
          onSuccess={importSignature}
          onClear={clear}
          showFileReader={false}
          shouldShowFileReader
          fileType="psbt"
        />

        <InteractionMessages
          messages={interaction.messagesFor({ state: status })}
          excludeCodes={["keystone.signature_request"]}
        />

        <FormHelperText error>{signatureError}</FormHelperText>
      </Box>
    </Box>
  );
};

KeystoneSignatureImporter.propTypes = {
  walletName: PropTypes.string.isRequired,
  network: PropTypes.string.isRequired,
  inputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  outputs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  signatureImporter: PropTypes.shape({
    bip32Path: PropTypes.string,
  }).isRequired,
  resetBIP32Path: PropTypes.func.isRequired,
  validateAndSetSignature: PropTypes.func.isRequired,
  enableChangeMethod: PropTypes.func.isRequired,
  disableChangeMethod: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    walletName: state.wallet.common.walletName,
  };
}

const mapDispatchToProps = {};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(KeystoneSignatureImporter);
