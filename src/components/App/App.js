import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import theme from './theme';
import Dashboard from './../dashboard/Dashboard';
import Signin from './../signin/Signin';
import PageNotFound from './../page_not_found/PageNotFound';
import { ThemeProvider } from 'react-css-themr';

class App extends Component {

  render() {
    console.log(theme)
    return (
      <ThemeProvider theme={theme}>
        <Router basename="/">
          <div className="adex-dapp">
            <Switch>
              <Route path="/dashboard/:side/" component={Dashboard} />
              <Redirect from="/dashboard" to="/side-select"/>
              <Route path="/" component={Signin} />
              
              <Route component={PageNotFound} />
            </Switch>
          </div>
        </Router>
      </ThemeProvider>
    );
  }
}

export default App;
