import React from "react";
import PropTypes from "prop-types";

// Components
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Warning } from "@mui/icons-material";

const Conflict = ({ message }) => {
  return (
    <small>
      <List>
        <ListItem color="error.main">
          <ListItemIcon>
            <Typography color="error">
              <Warning />
            </Typography>
          </ListItemIcon>
          <ListItemText>
            <Typography color="error">{message}</Typography>
          </ListItemText>
        </ListItem>
      </List>
    </small>
  );
};

Conflict.propTypes = {
  message: PropTypes.string.isRequired,
};

export default Conflict;
