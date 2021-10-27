import React, { useEffect } from 'react'
import 'react-image-crop/dist/ReactCrop.css'
import './App.css'
import { Provider } from 'react-redux'
import { persistor, store } from 'store'
import history from 'store/history'
import { ConnectedRouter } from 'connected-react-router'
import Toast from 'components/toast/Toast'
import Confirm from 'components/confirm/Confirm'
import { PersistGate } from 'redux-persist/integration/react'
import Root from './Root'
import { DateUtils } from 'helpers/dateUtils'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import CssBaseline from '@material-ui/core/CssBaseline'
import CacheBuster from './CacheBuster'
import { updateWindowReloading, updateProject, execute } from 'actions'
import MultiThemeProvider from './MultiThemeProvider'
import Loading from './Loading'
import NetworkErrorDetector from './NetworkErrorDetector'

const onBeforeLift = () => {
	// take some action before the gate lifts
}

const App = () => {
	useEffect(() => {
		execute(updateWindowReloading(false))

		function onReload() {
			execute(updateWindowReloading(true))
		}

		window.addEventListener('beforeunload', onReload)

		return () => {
			window.removeEventListener('beforeunload', onReload)
		}
	})

	return (
		<React.Fragment>
			<Provider store={store}>
				<PersistGate
					loading={<Loading />}
					onBeforeLift={onBeforeLift}
					persistor={persistor}
				>
					<ConnectedRouter history={history}>
						<MultiThemeProvider>
							<CssBaseline />
							<NetworkErrorDetector />
							<MuiPickersUtilsProvider utils={DateUtils}>
								<CacheBuster>
									<div className='adex-dapp'>
										<Root />
										<Toast />
										<Confirm />
									</div>
								</CacheBuster>
							</MuiPickersUtilsProvider>
						</MultiThemeProvider>
					</ConnectedRouter>
				</PersistGate>
			</Provider>
		</React.Fragment>
	)
}

export default App
