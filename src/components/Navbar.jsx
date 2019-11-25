import React from 'react';
import { AppBar, Toolbar, Button,  makeStyles, Typography } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

const Navbar = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
              Caravan
          </Typography>

          <Button color="inherit" href="#/wallet" target="_blank">Wallet</Button>

          <Button color="inherit" href="#/address" target="_blank">Create</Button>

          <Button color="inherit" href="#/spend" target="_blank">Interact</Button>

          <Button color="inherit" href="#/" target="_blank">Help</Button>

        </Toolbar>
      </AppBar>
    </div>
  );

}

export default Navbar;
