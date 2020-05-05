import React, { Component } from "react";
import PropTypes from "prop-types";
import { createBrowserHistory } from "history";
import { connect } from "react-redux";

import App from "./App";

class AppContainer extends Component {
  history = createBrowserHistory();

  componentDidMount() {
    const { resetApp } = this.props;
    // Listen for changes to the current location
    // and reset the redux store which is needed
    // to avoid conflicts in the state between views/pages
    this.unlisten = this.history.listen(() => {
      // add delay so the form doesn't seem to flash before view changes
      setTimeout(resetApp, 250);
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    return <App />;
  }
}

AppContainer.propTypes = {
  resetApp: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    resetApp: () => dispatch({ type: "RESET_APP_STATE" }),
  };
}

export default connect(null, mapDispatchToProps)(AppContainer);
