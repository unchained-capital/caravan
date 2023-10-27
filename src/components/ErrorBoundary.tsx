import React, { ErrorInfo } from "react";

import { Box, Typography } from "@mui/material";

const reportingURL = "https://github.com/unchained-capital/caravan/issues";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
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

export default ErrorBoundary;
