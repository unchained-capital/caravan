import React from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

// Components
import { Button, Container, createTheme, CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/styles";
import { SnackbarProvider } from "notistack";

import Help from "./Help";
import Wallet from "./Wallet";
import CreateAddress from "./CreateAddress";
import TestSuiteRun from "./TestSuiteRun";
import ScriptExplorer from "./ScriptExplorer";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ErrorBoundary from "./ErrorBoundary";
import ErrorNotification from "./ErrorNotification";

// FIXME: Currently there seems to be a bug in MUI v5 not allowing theme overriedes
const theme = createTheme({
  palette: {
    secondary: {
      main: "#e0e0e0",
    },
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <div className="App">
      <SnackbarProvider maxSnack={3}>
        <Container maxWidth="lg">
          <Navbar />
          <ErrorBoundary>
            <Router>
              <Switch>
                <Route path="/test" component={TestSuiteRun} />
                <Route path="/address" component={CreateAddress} />
                <Redirect from="/spend" to="/script" />
                <Route path="/script" component={ScriptExplorer} />
                <Route path="/wallet" component={Wallet} />
                <Route path="/help" component={Help} />
                <Route path="/" component={Help} />
              </Switch>
            </Router>
            <ErrorNotification />
          </ErrorBoundary>
          <Footer />
        </Container>
      </SnackbarProvider>
    </div>
  </ThemeProvider>
);

export default App;
