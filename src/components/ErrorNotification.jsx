import React from "react";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Snackbar, IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { clearErrorNotification as clearErrorNotificationAction } from "../actions/errorNotificationActions";

const ErrorNotificationBase = ({ open, message, clearErrorNotification }) => {
  return (
    <Snackbar
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={open}
      /* autoHideDuration={6000} */
      onClose={clearErrorNotification}
      ContentProps={{
        "aria-describedby": "error-notification",
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
};

ErrorNotificationBase.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  clearErrorNotification: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => {
  return state.errorNotification;
};

const mapDispatchToProps = {
  clearErrorNotification: clearErrorNotificationAction,
};

const ErrorNotification = connect(
  mapStateToProps,
  mapDispatchToProps
)(ErrorNotificationBase);

export default ErrorNotification;
