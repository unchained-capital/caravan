import React from "react";
import {
  HashRouter as Router,
  Route,
  Switch,
  Redirect,
} from "react-router-dom";

// Components
import { CssBaseline, Container } from "@material-ui/core";
import { SnackbarProvider } from "notistack";

import Help from "./Help";
import Wallet from "./Wallet";
import CreateAddress from "./CreateAddress";
import TestSuiteRun from "./TestSuiteRun";
import ScriptExplorer from "./ScriptExplorer";
import PsbtSpend from "./Psbt";
import HermitPsbtInterface from "./Hermit/HermitPsbtInterface";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ErrorBoundary from "./ErrorBoundary";
import ErrorNotification from "./ErrorNotification";

const App = () => (
  <div className="App">
    <CssBaseline />
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
              <Route path="/psbt" component={PsbtSpend} />
              <Route path="/wallet" component={Wallet} />
              <Route path="/hermit-psbt" component={HermitPsbtInterface} />
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
);

export default App;
