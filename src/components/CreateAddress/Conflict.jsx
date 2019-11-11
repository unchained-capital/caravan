import React from 'react';
// Components
import { 
    List, ListItem, ListItemIcon, ListItemText, Typography
  } from '@material-ui/core';
import {Warning} from '@material-ui/icons';
  
const Conflict = () => {
    return (
        <small>
          <List>
            <ListItem color="error.main">
            <ListItemIcon>
            <Typography color="error"><Warning/></Typography>
            </ListItemIcon>
            <ListItemText>
              <Typography color="error">
                Warning, BIP32 path is in conflict with the network and address type settings.  Do not proceed unless you are absolutely sure you know what you are doing!
              </Typography>
            </ListItemText>
          </ListItem>
        </List>
      </small>
    );
  }
  
  export default Conflict;
  