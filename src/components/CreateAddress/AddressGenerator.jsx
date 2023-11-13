import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  generateMultisigFromPublicKeys,
  scriptToHex,
  multisigRedeemScript,
  multisigWitnessScript,
  validatePublicKey,
} from "unchained-bitcoin";
import {
  Box,
  Grid,
  Button,
  Card,
  CardHeader,
  CardContent,
  FormHelperText,
} from "@mui/material";
import { downloadFile } from "utils";
import { externalLink } from "utils/ExternalLink";

// Actions
import {
  sortPublicKeyImporters as sortPublicKeyImportersAction,
  setMultisigAddress as setMultisigAddressAction,
} from "../../actions/publicKeyImporterActions";

// Components
import MultisigDetails from "../MultisigDetails";
import Conflict from "./Conflict";

const AddressGenerator = ({
  publicKeyImporters,
  addressType,
  sortPublicKeyImporters,
  network,
  totalSigners,
  requiredSigners,
  setMultisigAddress,
}) => {
  const isInConflict = () => {
    return Object.values(publicKeyImporters).some(
      (importer) => importer.conflict
    );
  };

  const publicKeyCount = () => {
    return Object.values(publicKeyImporters).filter(
      ({ publicKey, finalized }) => {
        return finalized && !validatePublicKey(publicKey, addressType);
      }
    ).length;
  };

  const publicKeysAreCanonicallySorted = () => {
    const publicKeys = Object.values(publicKeyImporters)
      .map((publicKeyImporter) => publicKeyImporter.publicKey)
      .filter((publicKey) => publicKey !== "");
    const sortedPublicKeys = Object.values(publicKeyImporters)
      .map((publicKeyImporter) => publicKeyImporter.publicKey)
      .filter((publicKey) => publicKey !== "")
      .sort(); // sort mutates the array
    const sorted =
      publicKeys.filter((publicKey, index) => {
        return publicKey === sortedPublicKeys[index];
      }).length === publicKeys.length;
    return sorted;
  };

  const canonicallySortPublicKeys = () => {
    sortPublicKeyImporters();
  };

  const generateMultisig = () => {
    const publicKeys = [];
    for (
      let publicKeyImporterNum = 1;
      publicKeyImporterNum <= totalSigners;
      publicKeyImporterNum += 1
    ) {
      publicKeys.push(publicKeyImporters[publicKeyImporterNum].publicKey);
    }

    const multisig = generateMultisigFromPublicKeys(
      network,
      addressType,
      requiredSigners,
      ...publicKeys
    );
    setMultisigAddress(multisig.address);
    return multisig;
  };

  const addressDetailsFilename = (multisig) => {
    return `bitcoin-${requiredSigners}-of-${totalSigners}-${addressType}-${multisig.address}.txt`;
  };

  const publicKeyImporterBIP32Path = (number) => {
    const publicKeyImporter = publicKeyImporters[number];
    const bip32Path =
      publicKeyImporter.method === "text"
        ? "Unknown (make sure you have written this down previously!)"
        : publicKeyImporter.bip32Path;
    return `  * ${publicKeyImporter.name}: ${bip32Path}: ${publicKeyImporter.publicKey}`;
  };

  const publicKeyImporterBIP32Paths = () => {
    const formattedReturnArray = [];
    for (
      let publicKeyImporterNum = 1;
      publicKeyImporterNum <= totalSigners;
      publicKeyImporterNum += 1
    ) {
      formattedReturnArray.push(
        publicKeyImporterBIP32Path(publicKeyImporterNum)
      );
    }
    return formattedReturnArray.join("\n");
  };

  const addressDetailsText = (multisig) => {
    const redeemScript = multisigRedeemScript(multisig);
    const witnessScript = multisigWitnessScript(multisig);
    const redeemScriptLine = redeemScript
      ? `Redeem Script: ${scriptToHex(redeemScript)}`
      : "";
    const witnessScriptLine = witnessScript
      ? `Witness Script: ${scriptToHex(witnessScript)}`
      : "";
    const scriptsSpacer = redeemScript && witnessScript ? "\n\n" : "";
    return `Address: ${multisig.address}

Type: ${addressType}

Network: ${network}

Quorum: ${requiredSigners}-of-${totalSigners}

BIP32 Paths:
${publicKeyImporterBIP32Paths()}

${redeemScriptLine}${scriptsSpacer}${witnessScriptLine}
`;
  };

  const downloadAddressDetails = (event) => {
    event.preventDefault();
    const multisig = generateMultisig();
    const body = addressDetailsText(multisig);
    const filename = addressDetailsFilename(multisig);
    downloadFile(body, filename);
  };

  const title = () => {
    return (
      <Grid container justifyContent="space-between">
        <Grid item>
          {requiredSigners}
          -of-
          {totalSigners} Multisig {addressType}{" "}
        </Grid>
        <Grid item>
          <small>{`Public Keys: ${publicKeyCount()}/${totalSigners}`}</small>
        </Grid>
      </Grid>
    );
  };

  const body = () => {
    if (publicKeyCount() === totalSigners) {
      const multisig = generateMultisig();

      const canonicallySorted = publicKeysAreCanonicallySorted();
      return (
        <div>
          {isInConflict() && <Conflict />}
          {!canonicallySorted && (
            <Grid container justifyContent="space-between">
              <Grid item md={8}>
                <FormHelperText error>
                  WARNING: These public keys are not in the standard{" "}
                  {externalLink(
                    "https://github.com/bitcoin/bips/blob/master/bip-0067.mediawiki",
                    "BIP67 order"
                  )}
                  .
                </FormHelperText>
              </Grid>
              <Grid item md={4}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={canonicallySortPublicKeys}
                >
                  Sort Public Keys
                </Button>
              </Grid>
            </Grid>
          )}

          <Box mt={2}>
            <MultisigDetails multisig={multisig} />
          </Box>

          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={downloadAddressDetails}
            >
              Download Address Details
            </Button>
          </Box>
        </div>
      );
    }
    return (
      <p>
        {`Once you have imported all ${totalSigners} public keys, your address details will be displayed here.`}
      </p>
    );
  };

  return (
    <Card>
      <CardHeader title={title()} />
      <CardContent>{body()}</CardContent>
    </Card>
  );
};

AddressGenerator.propTypes = {
  network: PropTypes.string.isRequired,
  totalSigners: PropTypes.number.isRequired,
  requiredSigners: PropTypes.number.isRequired,
  addressType: PropTypes.string.isRequired,
  publicKeyImporters: PropTypes.shape({}).isRequired,
  sortPublicKeyImporters: PropTypes.func.isRequired,
  setMultisigAddress: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  return {
    ...state.settings,
    ...state.address,
  };
}

const mapDispatchToProps = {
  sortPublicKeyImporters: sortPublicKeyImportersAction,
  setMultisigAddress: setMultisigAddressAction,
};

export default connect(mapStateToProps, mapDispatchToProps)(AddressGenerator);
