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
import { Typography, Grid, Box, Chip } from "@material-ui/core";
import { OpenInNew } from "@material-ui/icons";
import { externalLink } from "../utils";

// Components
import Copyable from "./Copyable";

class MultisigDetails extends React.Component {
  renderScript = (name, script) => {
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

  render() {
    const { network, multisig, showAddress } = this.props;
    const { address } = multisig;
    const redeemScript = multisigRedeemScript(multisig);
    const witnessScript = multisigWitnessScript(multisig);
    return (
      <Box mt={2}>
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

            <Grid item justify="center" container spacing={3}>
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

        {this.renderScript("Script", multisig)}
        {redeemScript && this.renderScript("Redeem Script", redeemScript)}
        {witnessScript && this.renderScript("Witness Script", witnessScript)}
      </Box>
    );
  }
}

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
