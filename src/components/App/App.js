import React, { Component } from 'react'
import { Route, Switch, Redirect } from 'react-router-dom'
import './App.css'
import theme from './theme'
import Dashboard from 'components/dashboard/Dashboard'
import Signin from 'components/signin/Signin'
import PageNotFound from 'components/page_not_found/PageNotFound'
import { ThemeProvider } from 'react-css-themr'
import { Provider } from 'react-redux'
import configureStore from 'store/configureStore'
import history from 'store/history'
import { ConnectedRouter } from 'react-router-redux'
import Toast from 'components/toast/Toast'
import Confirm from 'components/confirm/Confirm'
import { PersistGate } from 'redux-persist/es/integration/react'
import Root from './Root'

const { persistor, store } = configureStore()
console.log('initial store', store.getState())

const onBeforeLift = () => {
  // take some action before the gate lifts
}

class App extends Component {

  render() {
    // console.log(theme)

    const { location } = this.props
    return (
      <ThemeProvider theme={theme}>
        <Provider store={store}>
          <PersistGate
            onBeforeLift={onBeforeLift}
            persistor={persistor}>
            <ConnectedRouter history={history} >
              <div className="adex-dapp">
                <Switch >
                  <Root location2={location} />
                </Switch>
                <Toast />
                <Confirm />
              </div>
            </ConnectedRouter>

          </PersistGate>
        </Provider>
      </ThemeProvider>
    )
  }
}

export default App
