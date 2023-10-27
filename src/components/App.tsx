import React from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

// Components
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { SnackbarProvider } from "notistack";

import theme from "./theme";
import Help from "./Help";
import Wallet from "./Wallet";
import CreateAddress from "./CreateAddress";
import TestSuiteRun from "./TestSuiteRun";
import ScriptExplorer from "./ScriptExplorer";
import HermitPsbtInterface from "./Hermit/HermitPsbtInterface";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ErrorBoundary from "./ErrorBoundary";
import ErrorNotification from "./ErrorNotification";

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <div className="App">
      <SnackbarProvider maxSnack={3}>
        <Router basename="/">
          <Container maxWidth={false} sx={{ maxWidth: "1280px" }}>
            <Navbar />
            <ErrorBoundary>
              <Switch>
                <Route path="/test" component={TestSuiteRun} />
                <Route path="/address" component={CreateAddress} />
                <Redirect from="/spend" to="/script" />
                <Route path="/script" component={ScriptExplorer} />
                <Route path="/hermit-psbt" component={HermitPsbtInterface} />
                <Route path="/wallet" component={Wallet} />
                <Route path="/help" component={Help} />
                <Route path="/" component={Help} />
              </Switch>
              <ErrorNotification />
            </ErrorBoundary>
            <Footer />
          </Container>
        </Router>
      </SnackbarProvider>
    </div>
  </ThemeProvider>
);

export default App;
