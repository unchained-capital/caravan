import React from 'react';
import {connect} from "react-redux";

import {
  clearErrorNotification,
} from "../actions/errorNotificationActions";

import { 
  Snackbar, Button, IconButton
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

class ErrorNotificationBase extends React.Component {

  render() {
    const {open, message, clearErrorNotification} = this.props;
    return (
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        open={open}
        /* autoHideDuration={6000} */
        onClose={clearErrorNotification}
        ContentProps={{
          'aria-describedby': 'error-notification',
        }}
        message={<span id="error-notification">{message}</span>}
        action={[
          <IconButton
            key="close"
            aria-label="close"
            color="inherit"
            onClick={clearErrorNotification}
          >
            <Close />
          </IconButton>,
        ]}
      /> 
    );
  }

}

const mapStateToProps = (state) => {
  return state.errorNotification;
};

const mapDispatchToProps = {
  clearErrorNotification,
};

const ErrorNotification = connect(mapStateToProps, mapDispatchToProps)(ErrorNotificationBase);

export {ErrorNotification};
