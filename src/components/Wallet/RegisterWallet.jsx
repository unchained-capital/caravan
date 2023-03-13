import React, { useMemo } from "react";
import {
  Box,
  Grid,
  Typography,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  makeStyles,
} from "@material-ui/core";
import { useSelector } from "react-redux";

import { ExpandMoreOutlined } from "@material-ui/icons";
import { MultisigWalletPolicy } from "unchained-wallets/lib/policy";
import { Alert, AlertTitle } from "@material-ui/lab";
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
            <Box my={1}>
              <Alert severity="info">
                <AlertTitle>Wallet Policy Details</AlertTitle>
                Policy template: <code>{policy.template}</code>
              </Alert>
            </Box>
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
            <PolicyRegistrationTable hmacs={walletConfig.ledgerPolicyHmacs} />
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default WalletRegistrations;
