import React from 'react';
import { AppBar, Toolbar, Button,  makeStyles, Typography, Menu, MenuItem } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';

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
  menuItem: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingX: theme.spacing(3),
  },
  menuLink: {
    color: 'inherit',
    textDecoration: 'none', 
  }
}));

const NavItem = ({ href, title, classes, handleClose }) => (
  <a href={href} className={classes.menuLink}>
    <MenuItem className={classes.menuItem} onClick={handleClose}>
      {title}
    </MenuItem>
  </a>
)

const Navbar = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const menuItems = [
    { href: '#/', title: 'Create Wallet' },
    { href: '#/create', title: 'Create Address' },
    { href: '#/script', title: 'Script Explorer' }, 
    { href: '#/help', title: 'Help' },
  ]

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
          <Button color="inherit" href="#/">Caravan</Button>
          </Typography>


          <Button aria-controls="simple-menu" aria-haspopup="true" color="inherit" onClick={handleClick} >
            <MenuIcon />
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
           {
              menuItems.map(({href, title}, index) => 
                <NavItem 
                  href={href} 
                  title={title} 
                  classes={classes} 
                  key={index}
                  handleClose={() => setAnchorEl(null)}
                />
              )
           } 
          </Menu>

        </Toolbar>
      </AppBar>
    </div>
  );

}

export default Navbar;
