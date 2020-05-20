import { Box, Typography } from "@material-ui/core";
import React from "react";
import PropTypes from "prop-types";

const reportingURL = "https://github.com/unchained-capital/caravan/issues";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      errorInfo,
      error,
    });
  }

  render() {
    const { children } = this.props;
    const { error, errorInfo } = this.state;
    if (errorInfo) {
      return (
        <Box m={4}>
          <Box m={2}>
            <Typography variant="h3" component="h1">
              Something went wrong.
            </Typography>
          </Box>
          <Box m={2}>
            <Typography variant="body1">
              Let us know what happened on{" "}
              <a href={reportingURL} target="_blank" rel="noopener noreferrer">
                github
              </a>
              .
            </Typography>
          </Box>
          <Box mx={2} my={3}>
            <details style={{ whiteSpace: "pre-wrap" }}>
              {error && error.toString()}
              <br />
              {errorInfo.componentStack}
            </details>
          </Box>
        </Box>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default ErrorBoundary;
