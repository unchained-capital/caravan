import React, { useEffect } from "react";
import { createBrowserHistory } from "history";
import { connect } from "react-redux";
// eslint-disable-next-line
import { Dispatch } from "redux";

import App from "./App";

interface AppContainerProps {
  resetApp: () => void;
}

const AppContainer = ({ resetApp }: AppContainerProps) => {
  const history = createBrowserHistory();

  useEffect(() => {
    // Listen for changes to the current location
    // and reset the redux store which is needed
    // to avoid conflicts in the state between views/pages
    const unlisten = history.listen(() => {
      resetApp();
    });

    return () => {
      unlisten();
    };
  }, []);

  return <App />;
};

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    resetApp: () => dispatch({ type: "RESET_APP_STATE" }),
  };
}

export default connect(null, mapDispatchToProps)(AppContainer);
