import React, { Component } from "react";
import { createBrowserHistory } from "history";
import { connect } from "react-redux";
import { Dispatch } from "redux";

import App from "./App";

interface AppContainerProps {
  resetApp: () => void;
}

class AppContainer extends Component<AppContainerProps> {
  history = createBrowserHistory();
  unlisten!: () => void;

  componentDidMount() {
    const { resetApp } = this.props;
    // Listen for changes to the current location
    // and reset the redux store which is needed
    // to avoid conflicts in the state between views/pages
    this.unlisten = this.history.listen(() => {
      resetApp();
    });
  }

  componentWillUnmount() {
    this.unlisten();
  }

  render() {
    return <App />;
  }
}

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    resetApp: () => dispatch({ type: "RESET_APP_STATE" }),
  };
}

export default connect(null, mapDispatchToProps)(AppContainer);
