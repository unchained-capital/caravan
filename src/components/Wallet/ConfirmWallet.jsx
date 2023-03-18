import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import {
  Alert,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Box,
} from "@mui/material";
import { MultisigWalletPolicy } from "unchained-wallets";
import { getWalletConfig } from "../../selectors/wallet";

const ConfirmationInfo = () => {
  const extendedPublicKeyImporters = useSelector(
    (state) => state.quorum.extendedPublicKeyImporters
  );
  return (
    <>
      {Object.values(extendedPublicKeyImporters).map((importer) => (
        <TableRow key={importer.extendedPublicKey}>
          <TableCell>{importer.name}</TableCell>
          <TableCell>
            {importer.method === "text" ? "N/A" : importer.bip32Path}
          </TableCell>
          <TableCell>{importer.extendedPublicKey}</TableCell>
        </TableRow>
      ))}
    </>
  );
};

const PolicyInfo = ({ keys }) => {
  const extendedPublicKeyImporters = useSelector(
    (state) => state.quorum.extendedPublicKeyImporters
  );

  const keyOriginsWithName = useMemo(() => {
    return Object.values(extendedPublicKeyImporters).map((importer) => {
      const origin = keys.find(
        (key) =>
          key.includes(importer.rootXfp) &&
          key.includes(importer.extendedPublicKey)
      );
      return { origin, name: importer.name };
    });
  }, [extendedPublicKeyImporters, keys]);

  return (
    <>
      {keyOriginsWithName.map(({ origin, name }) => (
        <TableRow key={origin}>
          <TableCell>{name}</TableCell>
          <TableCell>{origin}</TableCell>
        </TableRow>
      ))}
    </>
  );
};

PolicyInfo.propTypes = {
  keys: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const WalletConfirmation = () => {
  const startingAddressIndex = useSelector(
    (state) => state.settings.startingAddressIndex
  );
  const walletConfig = useSelector(getWalletConfig);

  const policy = useMemo(() => {
    // there could be edge cases where not all
    // info from config matches what we need for a policy
    try {
      return MultisigWalletPolicy.FromWalletConfig(walletConfig);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      return null;
    }
  }, [walletConfig]);

  if (policy)
    return (
      <Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Key Origin</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <PolicyInfo keys={policy.keys} />
          </TableBody>
        </Table>
      </Box>
    );
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
        <TableBody>
          <ConfirmationInfo />
        </TableBody>
      </Table>
    </Box>
  );
};

export default WalletConfirmation;
