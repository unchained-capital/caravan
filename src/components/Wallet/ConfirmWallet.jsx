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
import { Alert } from "@material-ui/lab";

class WalletConfirmation extends React.Component {
  render = () => {
    const { startingAddressIndex } = this.props;
    return (
      <Box>
        {startingAddressIndex > 0 && (
          <Alert severity="info">
            Starting Address Index set to {startingAddressIndex}
          </Alert>
        )}
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
  startingAddressIndex: PropTypes.number.isRequired,
  extendedPublicKeyImporters: PropTypes.shape({}).isRequired,
};

function mapStateToProps(state) {
  return {
    startingAddressIndex: state.settings.startingAddressIndex,
    extendedPublicKeyImporters: state.quorum.extendedPublicKeyImporters,
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(WalletConfirmation);
