import { Box, Typography } from "@material-ui/core";
import React from "react";

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
              Let us know what happened on
{" "}
              <a href={reportingURL} target="_blank">
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

    return this.props.children;
  }
}

export { ErrorBoundary };
