import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Dashboard from './../dashboard/Dashboard';
import Signin from './../signin/Signin';
import PageNotFound from './../page_not_found/PageNotFound';

class App extends Component {

  render() {
    return (
      <Router basename="/">
        <div>
          <Switch>
            <Route exact path="/" component={Signin} />
            <Route path="/dashboard" component={Dashboard} />
            <Route component={PageNotFound} />
          </Switch>
        </div>
      </Router>
    );
  }
}

export default App;
