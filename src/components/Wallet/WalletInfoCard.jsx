import React from 'react';
import PropTypes from 'prop-types';

// Components
import { Card, CardContent, Typography, makeStyles, Grid } from '@material-ui/core';
import BitcoinIcon from '../BitcoinIcon';
import EditableName from "../EditableName";

const useStyles = makeStyles(theme => ({
  title: {
    fontSize: '2rem',
    color: '#212529',
  },
  balance: {
    fontSize: '1.2rem',
  },
  gutter: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingTop: theme.spacing(2),
  }
}));

const WalletInfoCard = ({ walletName, setName, balance=0, pendingBalance, editable, network, children }) => {
  const classes = useStyles();
  return (
    <Card>
      <CardContent>
        <Grid container direction="row"
          alignItems="center"
          >
        {
          editable ? (
            <Grid item>
              <Typography variant="h1" className={classes.title}>
                <EditableName number={0} name={walletName} setName={setName} />
              </Typography>
            </Grid>
          ) : (
            <React.Fragment>
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
                  <Typography variant="subtitle1" className={classes.balance}>
                    {balance} BTC
                    { pendingBalance !== 0 ?
                        <span 
                          style={{ 
                            color: pendingBalance > 0 ? 'green' : 'red',
                            margin: '21px',
                            fontSize: '1rem'
                           }}
                        >
                          {pendingBalance > 0 ? '+' : ''}
                          {pendingBalance} BTC
                         </span>
                      : ''
                    }
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="caption">Confirmed balance</Typography>
                </Grid>
              </Grid>
            </React.Fragment>
          )
        }
        </Grid>
        {children}
      </CardContent>
    </Card>
  )
}

WalletInfoCard.propTypes = {
  walletName: PropTypes.string.isRequired,
  network: PropTypes.string,
  balance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  pendingBalance: PropTypes.number,
  editable: PropTypes.bool.isRequired,
  setName: PropTypes.func.isRequired,
  children: PropTypes.node,
}

export default WalletInfoCard