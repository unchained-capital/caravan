import React, { useMemo } from "react";
import { useSelector } from "react-redux";

import {
  Alert,
  AlertTitle,
  Box,
  Grid,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import { ExpandMoreOutlined } from "@mui/icons-material";
import { MultisigWalletPolicy } from "unchained-wallets";

import { getWalletConfig } from "../../selectors/wallet";
import PolicyRegistrationTable from "../RegisterWallet/PolicyRegistrationsTable";
import {
  DownloadColdardConfigButton,
  RegisterLedgerButton,
} from "../RegisterWallet";

const useStyles = makeStyles({ expanded: { margin: "0 0!important" } });
const WalletRegistrations = () => {
  const walletConfig = useSelector(getWalletConfig);
  const classes = useStyles();
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

  const missingXfps = useMemo(() => {
    if (!walletConfig?.extendedPublicKeys) return false;
    return !walletConfig.extendedPublicKeys.every(
      (xpub) => xpub?.xfp.length === 8
    );
  }, [walletConfig]);

  // should setup to be masked in the future like
  // with bip32 paths
  if (missingXfps)
    return (
      <Typography color="error">
        Wallet configuration missing root fingerprints (also known as an xfp).
        Some devices will be unable to sign until all keys are used to rebuild
        the multisig wallet.
      </Typography>
    );

  return (
    <Box my={2}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreOutlined />}
          aria-controls="wallet-registration-content"
          id="wallet-registration-header"
          classes={{ expanded: classes.expanded }}
        >
          <Box>
            <Typography variant="h5">Wallet Registration</Typography>
            {policy?.template && (
              <Box my={1}>
                <Alert severity="info">
                  <AlertTitle>Wallet Policy Details</AlertTitle>
                  <p>
                    Policy template: <code>{policy.template}</code>
                  </p>
                  <p>
                    Wallet Uuid: <code>{policy.name}</code>
                  </p>
                </Alert>
              </Box>
            )}
            <Typography variant="caption">
              Some devices allow a multisig wallet to be registered in order to
              verify addresses and transactions
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Grid container spacing={2}>
              <Grid item>
                <RegisterLedgerButton />
              </Grid>
              <Grid item>
                <DownloadColdardConfigButton />
              </Grid>
            </Grid>
            {walletConfig.ledgerPolicyHmacs.length ? (
              <PolicyRegistrationTable hmacs={walletConfig.ledgerPolicyHmacs} />
            ) : (
              <Box my={1}>
                <Typography variant="body2">
                  (No known registrations available.)
                </Typography>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default WalletRegistrations;
