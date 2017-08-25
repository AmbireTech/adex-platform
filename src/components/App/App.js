import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
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
              <Route exact path="/" component={Signin} />
              <Route path="/dashboard" component={Dashboard} />
              <Route component={PageNotFound} />
            </Switch>
          </div>
        </Router>
      </ThemeProvider>
    );
  }
}

export default App;
