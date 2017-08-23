import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Dashboard from './../Dashboard/Dashboard';
import Signin from './../Signin/Signin';
import PageNotFound from './../PageNotFound/PageNotFound';

class App extends Component {

  render() {
    return (
      <Router basename="/">
        <div>
          <Route exact path="/" component={Signin} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="*" component={PageNotFound} />
        </div>
      </Router>
    );
  }
}

export default App;
