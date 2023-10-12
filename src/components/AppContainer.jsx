import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { createBrowserHistory } from "history";
import { connect } from "react-redux";

import App from "./App";

const AppContainer = ({ resetApp }) => {
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

AppContainer.propTypes = {
  resetApp: PropTypes.func.isRequired,
};

function mapDispatchToProps(dispatch) {
  return {
    resetApp: () => dispatch({ type: "RESET_APP_STATE" }),
  };
}

export default connect(null, mapDispatchToProps)(AppContainer);
