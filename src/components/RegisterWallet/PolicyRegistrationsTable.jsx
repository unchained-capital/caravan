import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { useSelector } from "react-redux";

const PolicyRegistrationTable = ({ hmacs }) => {
  const extendedPublicKeyImporters = useSelector(
    (state) => state.quorum.extendedPublicKeyImporters
  );

  const hmacsWithName = useMemo(() => {
    return Object.values(extendedPublicKeyImporters)
      .map((importer) => {
        const policyHmac = hmacs.find(
          (hmac) => hmac.xfp === importer.rootXfp
        )?.policyHmac;
        return { policyHmac, name: importer.name };
      })
      .filter((registration) => registration.policyHmac);
  }, [hmacs, extendedPublicKeyImporters]);

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
