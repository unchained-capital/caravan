import React from 'react';
import {externalLink} from "../utils";

// Components
import {
  Box, Typography, CardHeader, CardContent, Grid, Card, Button,
  List, ListItem, ListItemText, ListItemIcon, CardActions,
} from "@material-ui/core";
import {Description, GitHub, YouTube, BugReport, Speed} from "@material-ui/icons";
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

            <CardHeader title="Stateless Multisig Coordinator"/>

            <CardContent>

              <p>
                Caravan is making bitcoin <strong>multisig</strong> custody easier and safer through transparency and standards.
              </p>

              <p>
                Caravan is a <strong>coordination</strong> software.  It connects to a source of consensus and your keys to build and interact with multisig bitcoin addresses.
              </p>

              <p>Caravan is also <strong>stateless</strong>.  It does not itself store any data.  You must safekeep the addresses (and redeem scripts & BIP32 paths) you create.</p>

            </CardContent>
          </Card>
        </Grid>


        <Grid item>
          <Card>
            <CardHeader title="Keys"/>
            <CardContent>

              <p>All bitcoin is ultimately protected by private keys.</p>

              <p>Your private key may live on a piece of paper, a hardware wallet, some software on a laptop, or even just in your mind.  Caravan, being stateless, cannot store your private key but it can talk to hardware devices or software applications which do.</p>

              <p>Caravan supports entering public keys and signatures via text, so any wallet which can export such data can be made compatible with Caravan.</p>

            </CardContent>
          </Card>
        </Grid>

        <Grid item>
          <Card>
            <CardHeader title="Consensus"/>
            <CardContent>

              <p>In order to look up address balances and broadcast transactions, Caravan requires knowledge of the constantly changing bitcoin network.</p>

              <p>Running a full bitcoin node is the best way to determine the current state of the bitcoin network.  Caravan can be easily configured to use your own bitcoin node for consensus information and broadcasting transactions.</p>

              <p>If you don't want to or cannot run your own full node, Caravan defaults to using the freely available API at <code>blockstream.info</code>.</p>

            </CardContent>
          </Card>
        </Grid>


      </Grid>

      <Grid container item md={4} spacing={4} direction="column">

        <Grid item>

          <Card>
            <CardHeader title="Learn More"></CardHeader>
            <CardContent>

              <List>

                <ListItem>
                  <ListItemIcon>
                    <Description />
                  </ListItemIcon>
                  <ListItemText>
                    {externalLink("https://www.unchained-capital.com/blog/the-caravan-arrives/", "Blog Post")}
                  </ListItemText>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <YouTube />
                  </ListItemIcon>
                  <ListItemText>
                    {externalLink("https://www.youtube.com/playlist?list=PLUM8mrUjWoPRsVGEZ1gTntqPd4xrQZoiH", "Video Tutorials")}
                  </ListItemText>
                </ListItem>

                <ListItem>
                  <ListItemIcon>
                    <GitHub />
                  </ListItemIcon>
                  <ListItemText>
                    {externalLink("https://github.com/unchained-capital/caravan", "Source Code")}
                  </ListItemText>
                </ListItem>

              </List>
            </CardContent>
          </Card>

        </Grid>

        <Grid item>
          <Card>
            <CardHeader title="Supported Devices"></CardHeader>
            <CardContent>
              Caravan has been <a href="#/test">tested</a> with the following hardware wallets:
              <ul>
                <li>{externalLink("https://shop.trezor.io/product/trezor-one-white", "Trezor One")}</li>
                <li>{externalLink("https://www.ledger.com/products/ledger-nano-s", "Ledger Nano S")}</li>
              </ul>
              And web browsers:
              <ul>
                <li>{externalLink("https://www.google.com/chrome/", "Chrome")}</li>
                <li>{externalLink("https://www.mozilla.org/en-US/firefox/new/", "Firefox")}</li>
              </ul>
              Seeing a bug or need a feature?
            </CardContent>
            <CardActions>
              <Button href="https://github.com/unchained-capital/caravan/issues"><BugReport /> &nbsp; Report Issue</Button>
              <Button href="#/test" type="secondary"><Speed /> &nbsp; Run Tests</Button>
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
