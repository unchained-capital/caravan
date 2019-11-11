import React from 'react';
import { HashRouter as Router, Route, Switch } from 'react-router-dom';

// Components
import Help from './Help';
import CreateAddress from './CreateAddress';
import Spend from './Spend';
import Navbar from './Navbar';
import Footer from "./Footer";
import { CssBaseline, Container } from '@material-ui/core';
import {ErrorBoundary} from './ErrorBoundry';


const App = () => (
  <div className="App">
    <CssBaseline />
    <Container maxWidth="lg">
      <Navbar />
      <ErrorBoundary>
        <Router>
          <Switch>
            <Route path="/address" component={CreateAddress} />
            <Route path="/spend" component={Spend} />
            <Route path="/" component={Help} />
          </Switch>
        </Router>
      </ErrorBoundary>
      <Footer />
    </Container>
  </div>
);

export default App;
