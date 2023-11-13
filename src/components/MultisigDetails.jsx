import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {
  scriptToOps,
  scriptToHex,
  networkLabel,
  multisigAddressType,
  multisigRedeemScript,
  multisigWitnessScript,
  multisigRequiredSigners,
  multisigTotalSigners,
  blockExplorerAddressURL,
} from "unchained-bitcoin";
import { Typography, Grid, Box, Chip } from "@mui/material";
import { OpenInNew } from "@mui/icons-material";
import { externalLink } from "utils/ExternalLink";

// Components
import Copyable from "./Copyable";

const MultisigDetails = ({ network, multisig, showAddress }) => {
  const renderScript = (name, script) => {
    const hex = scriptToHex(script);
    const ops = scriptToOps(script);
    return (
      <Box mt={2}>
        <Typography variant="h6">{name}</Typography>
        <Grid container spacing={2}>
          <Grid item sm={6}>
            <Copyable text={hex} showIcon code />
          </Grid>
          <Grid item sm={6}>
            <Copyable text={ops} showIcon code />
          </Grid>
        </Grid>
      </Box>
    );
  };

  const { address } = multisig;
  const redeemScript = multisigRedeemScript(multisig);
  const witnessScript = multisigWitnessScript(multisig);
  return (
    <Box mt={2} style={{ maxWidth: "1080px" }}>
      {showAddress && <Typography variant="h6">Address</Typography>}

      <Typography align="center" variant="h5">
        <Grid container direction="column" spacing={2}>
          {showAddress && (
            <Grid item>
              <Copyable text={address} showIcon code />
              &nbsp;
              {externalLink(
                blockExplorerAddressURL(address, network),
                <OpenInNew />
              )}
            </Grid>
          )}

          <Grid item justifyContent="center" container spacing={3}>
            <Grid item>
              <Chip label="BTC" />
            </Grid>

            <Grid item>
              <Chip label={networkLabel(network)} />
            </Grid>

            <Grid item>
              <Chip
                label={`${multisigRequiredSigners(
                  multisig
                )}-of-${multisigTotalSigners(multisig)}`}
              />
            </Grid>

            <Grid item>
              <Chip label={multisigAddressType(multisig)} />
            </Grid>
          </Grid>
        </Grid>
      </Typography>

      {renderScript("Script", multisig)}
      {redeemScript && renderScript("Redeem Script", redeemScript)}
      {witnessScript && renderScript("Witness Script", witnessScript)}
    </Box>
  );
};

MultisigDetails.propTypes = {
  multisig: PropTypes.shape({
    address: PropTypes.string,
  }).isRequired,
  network: PropTypes.string.isRequired,
  showAddress: PropTypes.bool,
};

MultisigDetails.defaultProps = {
  showAddress: true,
};

function mapStateToProps(state) {
  return state.settings;
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(MultisigDetails);
