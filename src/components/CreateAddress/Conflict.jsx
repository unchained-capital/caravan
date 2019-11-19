import React from 'react';
// Components
import {
    List, ListItem, ListItemIcon, ListItemText, Typography
  } from '@material-ui/core';
import {Warning} from '@material-ui/icons';

const Conflict = (props) => {
    return (
        <small>
          <List>
            <ListItem color="error.main">
            <ListItemIcon>
            <Typography color="error"><Warning/></Typography>
            </ListItemIcon>
            <ListItemText>
              <Typography color="error">
                {props.message}
              </Typography>
            </ListItemText>
          </ListItem>
        </List>
      </small>
    );
  }

  export default Conflict;
