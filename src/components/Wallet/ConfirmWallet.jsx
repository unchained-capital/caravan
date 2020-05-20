import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
} from "@material-ui/core";

class WalletConfirmation extends React.Component {
  render = () => {
    return (
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>BIP32 Path</TableCell>
              <TableCell>Extended Public Key</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{this.renderConfirmationInfo()}</TableBody>
        </Table>
      </Box>
    );
  };

  renderConfirmationInfo = () => {
    const { extendedPublicKeyImporters } = this.props;
    return Object.values(extendedPublicKeyImporters).map((importer) => (
      <TableRow key={importer.extendedPublicKey}>
        <TableCell>{importer.name}</TableCell>
        <TableCell>
          {importer.method === "text" ? "N/A" : importer.bip32Path}
        </TableCell>
        <TableCell>{importer.extendedPublicKey}</TableCell>
      </TableRow>
    ));
  };
}

WalletConfirmation.propTypes = {
  extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
};

function mapStateToProps(state) {
  return {
    extendedPublicKeyImporters: state.quorum.extendedPublicKeyImporters,
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(WalletConfirmation);
