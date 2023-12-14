import React from "react";

// Components
import {
  Box,
  Typography,
  CardHeader,
  CardContent,
  Grid,
  Card,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CardActions,
} from "@mui/material";
import {
  Description,
  GitHub,
  YouTube,
  BugReport,
  Speed,
  AccountBalanceWallet,
  SportsVolleyball,
} from "@mui/icons-material";
import { Link } from "react-router-dom";
import { externalLink } from "utils/ExternalLink";

import Disclaimer from "./Disclaimer";

const Help = () => (
  <div>
    <Box mt={4} mb={2}>
      <Typography variant="h2">Welcome to Caravan!</Typography>
    </Box>

    <Grid container spacing={3}>
      <Grid container item md={8} spacing={2} direction="column">
        <Grid item>
          <Card>
            <CardHeader title="Get Started" />
            <CardContent>
              <Box mb={3}>
                <Typography>
                  Start using caravan by choosing to either make a multisig
                  wallet or fully stateless address.
                </Typography>
              </Box>
              <Grid
                container
                alignItems="center"
                justifyContent="center"
                spacing={3}
              >
                <Grid item xs={10} md={4}>
                  <Button
                    component={Link}
                    to="/wallet"
                    variant="contained"
                    data-cy="setup-wallet-button"
                    size="large"
                    color="primary"
                    startIcon={<AccountBalanceWallet />}
                  >
                    Wallet
                  </Button>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Button
                    variant="contained"
                    data-cy="setup-address-button"
                    size="large"
                    color="secondary"
                    component={Link}
                    to="/address"
                    startIcon={<SportsVolleyball />}
                  >
                    Address
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item>
          <Card>
            <CardHeader title="Stateless Multisig Coordinator" />

            <CardContent>
              <p>
                Caravan makes bitcoin multisig custody easier and safer through
                transparency and standards.
              </p>

              <p>
                Caravan is a <strong>coordination software</strong> for multisig
                addresses and wallets. Caravan can be used to build a multisig
                wallet derived from xpubs, or individual multisig addresses
                derived from pubkeys. In both cases, in order to transact from
                the wallet or address, you must also have your private keys and
                BIP32 paths.
              </p>

              <p>
                Caravan is <strong>stateless</strong>. It does not itself store
                any data outside your current browser session. You must safekeep
                the wallet details (xpubs, BIP32 paths) and addresses (redeem
                scripts, BIP32 paths) that you create.
              </p>
            </CardContent>
          </Card>
        </Grid>

        <Grid item>
          <Card>
            <CardHeader title="Keys" />
            <CardContent>
              <p>All bitcoin is ultimately protected by private keys.</p>

              <p>
                Your private key may live on a piece of paper, a hardware
                wallet, some software on a laptop, or even just in your mind.
                Caravan, being stateless, does not store or ask for your private
                key but it can talk to hardware devices or software applications
                which do.
              </p>

              <p>
                Caravan supports entering public keys and signatures via text,
                so any wallet which can export such data can be made compatible
                with Caravan.
              </p>
            </CardContent>
          </Card>
        </Grid>

        <Grid item>
          <Card>
            <CardHeader title="Consensus" />
            <CardContent>
              <p>
                In order to look up wallet addresses and their balances, and
                broadcast transactions, Caravan requires knowledge of the
                constantly changing bitcoin network.
              </p>

              <p>
                Running a full bitcoin node is the most private way to determine
                the current state of the bitcoin network. Caravan can be easily
                configured to use your own node for consensus information and
                broadcasting transactions.
              </p>

              <p>
                If you don&apos;t want to or cannot run your own full node,
                Caravan defaults to using the freely available API at
                <code> mempool.space</code>.
              </p>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container item md={4} spacing={4} direction="column">
        <Grid item>
          <Card>
            <CardHeader title="Learn More" />
            <CardContent>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText>
                    {externalLink(
                      "https://unchained-capital.com/blog/gearing-up-the-caravan/",
                      "Blog Post"
                    )}
                  </ListItemText>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <YouTube />
                  </ListItemIcon>
                  <ListItemText>
                    {externalLink(
                      "https://www.youtube.com/playlist?list=PLUM8mrUjWoPRsVGEZ1gTntqPd4xrQZoiH",
                      "Video Tutorials"
                    )}
                  </ListItemText>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <GitHub />
                  </ListItemIcon>
                  <ListItemText>
                    {externalLink(
                      "https://github.com/unchained-capital/caravan",
                      "Source Code"
                    )}
                  </ListItemText>
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        <Grid item>
          <Card>
            <CardHeader title="Supported Devices" />
            <CardContent>
              Caravan has been <Link to="/test">tested</Link> with the following
              hardware wallets:
              <ul>
                <li>
                  {externalLink(
                    "https://shop.trezor.io/product/trezor-one-white",
                    "Trezor One"
                  )}
                </li>
                <li>
                  {externalLink(
                    "https://shop.trezor.io/product/trezor-model-t",
                    "Trezor Model T"
                  )}
                </li>
                <li>
                  {externalLink(
                    "https://www.ledger.com/products/ledger-nano-s",
                    "Ledger Nano S"
                  )}
                </li>
                <li>
                  {externalLink(
                    "https://www.ledger.com/products/ledger-nano-x",
                    "Ledger Nano X"
                  )}
                </li>
                <li>
                  {externalLink(
                    "https://coldcardwallet.com",
                    "Coldcard Mk2, Mk3, & Mk4"
                  )}
                </li>
              </ul>
              And web browsers:
              <ul>
                <li>
                  {externalLink("https://www.google.com/chrome/", "Chrome")}
                </li>
                <li>
                  {externalLink(
                    "https://www.mozilla.org/en-US/firefox/new/",
                    "Firefox"
                  )}
                </li>
              </ul>
              Seeing a bug or need a feature?
            </CardContent>
            <CardActions>
              <Button href="https://github.com/unchained-capital/caravan/issues">
                <BugReport /> &nbsp; Report Issue
              </Button>
              <Button data-cy="run-tests-button" component={Link} to="/test">
                <Speed /> &nbsp; Run Tests
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Grid>

    <Box mt={2}>
      <Disclaimer />
    </Box>
  </div>
);

export default Help;
