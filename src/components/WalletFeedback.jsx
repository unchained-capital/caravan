import React from 'react';
import PropTypes from 'prop-types';
import {
  INFO,
  WARNING,
  ERROR,
} from "unchained-wallets";
import { List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Info, Warning, Error } from '@material-ui/icons';

class WalletFeedback extends React.Component {

  static propTypes = {
    messages: PropTypes.array.isRequired,
    excludeCodes: PropTypes.array.isRequired,
  };

  static defaultProps = {
    messages: [],
    excludeCodes: [],
  }

  render = () => {
    return (
      <small>
        <List>
          {this.filteredMessages().map((m, i) => this.renderMessage(m, i))}
        </List>
      </small>
    );
  }

  renderMessage = (message, key) => {
    return (
      <ListItem key={key}>
        <ListItemIcon>
          {this.messageIcon(message)}
        </ListItemIcon>
        <ListItemText>
          {message.text}
        </ListItemText>
      </ListItem>
    );
  }

  filteredMessages = () => {
    const {messages, excludeCodes} = this.props;
    return messages.filter((message) => {
      for (let i=0; i < excludeCodes.length; i++) {
        const excludeCode = excludeCodes[i];
        if ((message.code || '').includes(excludeCode)) { return false; }
      }
      return true;
    });
  }

  messageIcon = (message) => {
    switch (message.level) {
    case INFO:
      return <Info />;
    case WARNING:
      return <Warning />;
    case ERROR:
      return <Error />;
    default:
      return null;
    }    
  }

  messageColrName = (message) => {
    switch (message.level) {
    case INFO:
      return "primary.main";
    case WARNING:
      return "text.secondary";
    case ERROR:
      return "error.main";
    default:
      return "";
    }
  }
}

export default WalletFeedback;
