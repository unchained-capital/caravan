import React from "react";
import PropTypes from "prop-types";
import { Grid, Box } from "@mui/material";
import { connect } from "react-redux";

// Components
import NetworkPicker from "../NetworkPicker";
import QuorumPicker from "../QuorumPicker";
import AddressTypePicker from "../AddressTypePicker";
import AddressGenerator from "./AddressGenerator";
import PublicKeyImporter from "./PublicKeyImporter";
import ClientPicker from "../ClientPicker";
import ImportAddressesButton from "../ImportAddressesButton";

import { clientPropTypes } from "../../proptypes";
import "../styles.css";

const CreateAddress = ({ address, client, totalSigners }) => {
  return (
    <Box mt={2}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <h1>Address Generator</h1>
        </Grid>
        <Grid item md={8}>
          <PublicKeyImporters totalSigners={totalSigners} />
          <Box mt={2}>
            <AddressGenerator />
          </Box>
        </Grid>
        <Grid item md={4}>
          <Box>
            <QuorumPicker />
          </Box>
          <Box mt={2}>
            <AddressTypePicker />
          </Box>
          <Box mt={2}>
            <NetworkPicker />
          </Box>
          <Box mt={2}>
            <ClientPicker
              publicNotes={
                <span>
                  If you plan to use this address with your own bitcoind node
                  you can import the address created here by switching for
                  &quot;Public&quot; to &quot;Private&quot;. Otherwise no action
                  is needed here.
                </span>
              }
              privateNotes={
                <div>
                  <ImportAddressesButton
                    addresses={[address]}
                    client={client}
                  />
                </div>
              }
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

const PublicKeyImporters = ({ totalSigners }) => {
  const publicKeyImporters = [];
  for (
    let publicKeyImporterNum = 1;
    publicKeyImporterNum <= totalSigners;
    publicKeyImporterNum += 1
  ) {
    publicKeyImporters.push(
      <Box key={publicKeyImporterNum} mt={publicKeyImporterNum === 1 ? 0 : 2}>
        <PublicKeyImporter number={publicKeyImporterNum} />
      </Box>
    );
  }
  return publicKeyImporters;
};

function mapStateToProps(state) {
  return {
    ...{ totalSigners: state.settings.totalSigners },
    ...state.address,
    client: state.client,
  };
}

CreateAddress.propTypes = {
  address: PropTypes.string,
  totalSigners: PropTypes.number.isRequired,
  client: PropTypes.shape(clientPropTypes).isRequired,
};

CreateAddress.defaultProps = {
  address: "",
};

export default connect(mapStateToProps)(CreateAddress);
