import React from "react";
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
  return (
    <Box mt={3}>
      <Accordion>
        <AccordionSummary
          expandIcon={<ExpandMoreOutlined />}
          aria-controls="wallet-registration-content"
          id="wallet-registration-header"
          classes={{ expanded: classes.expanded }}
        >
          <Box>
            <Typography variant="h5">Wallet Registration</Typography>
            <Typography variant="caption">
              Some devices allow a multisig wallet to be pre-registered in order
              to verify addresses and transactions
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
