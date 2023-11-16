import React from "react";
import PropTypes from "prop-types";
import { Network } from "unchained-bitcoin";

// Components
import { Card, CardContent, Typography, Grid } from "@mui/material";
import { makeStyles } from "@mui/styles";
import BitcoinIcon from "../BitcoinIcon";
import EditableName from "../EditableName";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100%",
  },
  title: {
    fontSize: "2rem",
    color: "#212529",
  },
  balance: {
    fontSize: "1.2rem",
  },
  gutter: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(2),
  },
}));

const WalletInfoCard = ({
  walletName,
  setName,
  balance = 0,
  pendingBalance,
  editable,
  network,
}) => {
  const classes = useStyles();
  return (
    <Card data-cy="wallet-info-card" className={classes.root}>
      <CardContent>
        <Grid container direction="row" alignItems="center">
          {editable ? (
            <Grid item>
              <Typography variant="h1" className={classes.title}>
                <EditableName number={0} name={walletName} setName={setName} />
              </Typography>
            </Grid>
          ) : (
            <>
              <Grid container alignItems="center" className={classes.gutter}>
                <Grid item xs={1}>
                  <BitcoinIcon network={network} />
                </Grid>
                <Grid item>
                  <Typography variant="h1" className={classes.title}>
                    {walletName}
                  </Typography>
                </Grid>
              </Grid>
              <Grid container className={classes.gutter}>
                <Grid item xs={12} mt={5}>
                  <Typography
                    data-cy="balance"
                    variant="subtitle1"
                    className={classes.balance}
                  >
                    {balance} BTC
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography data-cy="pending-balance" variant="caption">
                    {pendingBalance !== 0 ? (
                      <>
                        <span
                          style={{
                            color: pendingBalance > 0 ? "green" : "red",
                            fontWeight: "bold",
                          }}
                        >
                          {pendingBalance > 0 ? "+" : ""}
                          {pendingBalance} BTC
                        </span>{" "}
                        (unconfirmed)
                      </>
                    ) : (
                      ""
                    )}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

WalletInfoCard.propTypes = {
  walletName: PropTypes.string.isRequired,
  network: PropTypes.string,
  balance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pendingBalance: PropTypes.number,
  editable: PropTypes.bool.isRequired,
  setName: PropTypes.func.isRequired,
};

WalletInfoCard.defaultProps = {
  network: Network.TESTNET,
  balance: 0,
  pendingBalance: 0,
};

export default WalletInfoCard;
