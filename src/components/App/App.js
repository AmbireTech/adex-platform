import React, { Component } from 'react'
import { Switch } from 'react-router-dom'
import 'react-image-crop/dist/ReactCrop.css'
// import './App.css'
import { Provider } from 'react-redux'
import configureStore from 'store/configureStore'
import history from 'store/history'
import { ConnectedRouter } from 'react-router-redux'
import Toast from 'components/toast/Toast'
import Confirm from 'components/confirm/Confirm'
import { PersistGate } from 'redux-persist/es/integration/react'
import Root from './Root'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import { themeMUI } from './themeMUi'
import DateFnsUtils from 'material-ui-pickers/utils/date-fns-utils'
import MuiPickersUtilsProvider from 'material-ui-pickers/utils/MuiPickersUtilsProvider'

// window.TREZOR_POPUP_PATH = 'https://localhost/'
// window.TREZOR_POPUP_ORIGIN = 'http://localhost'
// window.TREZOR_POPUP_URL = 'http://localhost/popup/popup.html'

const { persistor, store } = configureStore
// console.log('initial store', store.getState())

const onBeforeLift = () => {
  // take some action before the gate lifts
}

class App extends Component {

  render() {
    return (
      <Provider store={store}>
        <PersistGate
          onBeforeLift={onBeforeLift}
          persistor={persistor}>
          <ConnectedRouter history={history} >
            <div className="adex-dapp">
              <MuiThemeProvider theme={themeMUI}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <Switch >
                    <Root />
                  </Switch>
                  <Toast />
                  <Confirm />
                </MuiPickersUtilsProvider>
              </MuiThemeProvider>
            </div>
          </ConnectedRouter>

        </PersistGate>
      </Provider>
    )
  }
}

export default App
