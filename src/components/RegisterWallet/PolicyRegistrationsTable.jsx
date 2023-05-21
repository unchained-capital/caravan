import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import { getHmacsWithName } from "../../selectors/wallet";

const PolicyRegistrationTable = ({ hmacs }) => {
  const hmacsWithName = useSelector(getHmacsWithName);

  if (!hmacs) {
    return (
      <Typography>
        (No ledger registrations have been saved with this wallet)
      </Typography>
    );
  }

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Device</TableCell>
            <TableCell>Registration</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {hmacsWithName.map(({ name, policyHmac }) => (
            <TableRow key={policyHmac}>
              <TableCell>{name}</TableCell>
              {/* Note that only ledgers currently support this registration type */}
              <TableCell>Ledger</TableCell>
              <TableCell>{policyHmac}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

PolicyRegistrationTable.propTypes = {
  hmacs: PropTypes.arrayOf(
    PropTypes.shape({ xfp: PropTypes.string, policyHmac: PropTypes.string })
  ).isRequired,
};

export default PolicyRegistrationTable;
