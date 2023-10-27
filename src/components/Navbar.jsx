import React from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import MenuIcon from "@mui/icons-material/Menu";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
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
    color: "inherit",
    textDecoration: "none",
  },
}));

const NavItem = ({ href, title, classes, handleClose }) => {
  return (
    <Link to={href} className={classes.menuLink}>
      <MenuItem className={classes.menuItem} onClick={handleClose}>
        {title}
      </MenuItem>
    </Link>
  );
};

NavItem.propTypes = {
  href: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  classes: PropTypes.shape({
    menuLink: PropTypes.string.isRequired,
    menuItem: PropTypes.string.isRequired,
  }).isRequired,
  handleClose: PropTypes.func.isRequired,
};

const Navbar = () => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const menuItems = [
    { href: "/wallet", title: "Wallet" },
    { href: "/address", title: "Create Address" },
    { href: "/script", title: "Script Explorer" },
    { href: "/hermit-psbt", title: "Hermit PSBT Interface" },
    { href: "/test", title: "Test Suite" },
    { href: "/help", title: "Help" },
  ];

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            <Button color="inherit" component={Link} to="/">
              Caravan
            </Button>
          </Typography>

          <Button
            aria-controls="simple-menu"
            aria-haspopup="true"
            color="inherit"
            onClick={handleClick}
          >
            <Box mr={3}>
              <Typography>Menu</Typography>
            </Box>
            <MenuIcon />
          </Button>
          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {menuItems.map(({ href, title }) => (
              <NavItem
                href={href}
                title={title}
                classes={classes}
                key={href}
                handleClose={() => setAnchorEl(null)}
              />
            ))}
          </Menu>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Navbar;
