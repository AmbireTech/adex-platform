import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import './App.css';
import theme from './theme';
import Dashboard from './../dashboard/Dashboard';
import Signin from './../signin/Signin';
import PageNotFound from './../page_not_found/PageNotFound';
import { ThemeProvider } from 'react-css-themr';
import { Provider } from 'react-redux';
import configureStore from './../../store/configureStore';
import history from './../../store/history';
import initialState from './../../store/tempInitialState';
import { ConnectedRouter } from 'react-router-redux'

console.log('initial sate', initialState)

const store = configureStore()
console.log('store', store.getState())

class App extends Component {

  render() {
    // console.log(theme)

    const { location } = this.props;
    return (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <ConnectedRouter history={history} >
            <div className="adex-dapp">
              <Switch location={location}>
                <Route path="/dashboard/:side"  component={Dashboard} />
                <Redirect from="/dashboard" to="/side-select"/>
                <Route path="/" component={Signin} />
                
                <Route component={PageNotFound} />
              </Switch>
            </div>
          </ConnectedRouter>
        </Provider>
      </ThemeProvider>
    );
  }
}

export default App;
