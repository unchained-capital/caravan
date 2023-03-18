import React from "react";
import { Grid, Box } from "@mui/material";
import { externalLink } from "../utils";

// Components

// Assets
import logo from "../images/logo.png";

/* eslint-disable */
const APP_VERSION = VITE_APP_VERSION;
const GIT_SHA = VITE_GIT_SHA;
/* eslint-enable */

const Footer = () => (
  <Box mt={2}>
    <hr />
    <Grid container justify="space-between" alignItems="center">
      <Grid item sm={2}>
        {externalLink(
          "https://www.unchained-capital.com",
          <img
            src={logo}
            className="logo"
            alt="Unchained Capital logo"
            height="32"
          />
        )}
      </Grid>

      <Grid item sm={5}>
        <p>
          Copyright&nbsp;
          {new Date(Date.now()).getFullYear()} by Unchained Capital and released
          under an MIT license.
        </p>
      </Grid>

      <Grid item sm={2} align="right">
        <p>{`v${APP_VERSION} commit: ${GIT_SHA}`}</p>
      </Grid>
    </Grid>
  </Box>
);

export default Footer;
