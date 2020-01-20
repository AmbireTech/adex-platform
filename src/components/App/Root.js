import React, { useEffect } from 'react'
import { HashRouter as Router } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
	metamaskChecks,
	metamaskNetworkCheck,
	getRelayerConfig,
	execute,
	ensureQuickWalletBackup,
	updateRegistrationAllowed,
} from 'actions'
import { Route, Switch, Redirect } from 'react-router'
import Dashboard from 'components/dashboard/dashboard/Dashboard'
import ConnectHoc from 'components/signin/ConnectHoc'
import {
	CreateQuickIdentity,
	LoginStandardIdentity,
	CreateStandardIdentity,
	LoginQuickIdentity,
} from 'components/signin/identity/Identity'
import SideSelect from 'components/signin/side-select/SideSelect'
import PageNotFound from 'components/page_not_found/PageNotFound'
import Home from 'components/signin/Home'
import JustDialog from 'components/common/dialog/JustDialog'
import { migrateLegacyWallet, removeLegacyKey } from 'services/wallet/wallet'
import Translate from 'components/translate/Translate'
import { selectAuth, selectWallet, selectLocation } from 'selectors'

const ConnectedCreateQuickIdentity = ConnectHoc(JustDialog(CreateQuickIdentity))
const ConnectedQuickLogin = ConnectHoc(JustDialog(LoginQuickIdentity))
const ConnectedLoginStandardIdentity = ConnectHoc(
	JustDialog(LoginStandardIdentity)
)
const ConnectedCreateStandardIdentity = ConnectHoc(
	JustDialog(CreateStandardIdentity)
)
const ConnectedRoot = ConnectHoc(Home)

const PrivateRoute = ({ component: Component, auth, ...other }) => {
	return (
		<Route
			{...other}
			render={props =>
				auth === true ? ( //|| true
					<Component {...props} />
				) : (
					<Redirect to={{ pathname: '/', state: { from: props.location } }} />
				)
			}
		/>
	)
}

const handleLegacyWallet = wallet => {
	const { type, email, password, authType } = wallet || {}

	if (!type && email && password && authType === 'grant') {
		migrateLegacyWallet({ email, password })
		removeLegacyKey({ email, password })
	}

	if (email && password && authType) {
		execute(ensureQuickWalletBackup())
	}
}

const Root = () => {
	const auth = useSelector(selectAuth)
	const wallet = useSelector(selectWallet)
	const location = useSelector(selectLocation)

	useEffect(() => {
		execute(getRelayerConfig())
		execute(metamaskChecks())
	}, [])

	useEffect(() => {
		handleLegacyWallet(wallet)
	}, [wallet])

	useEffect(() => {
		execute(metamaskNetworkCheck())
		execute(updateRegistrationAllowed(location.search))
	}, [location])

	return (
		<Router>
			<Switch>
				<PrivateRoute
					auth={auth}
					path='/dashboard/:side'
					component={Dashboard}
				/>
				<PrivateRoute auth={auth} path='/side-select' component={SideSelect} />
				<Route exact path='/' component={ConnectedRoot} />
				<Route
					exact
					path='/signup/quick'
					component={ConnectedCreateQuickIdentity}
				/>
				<Route
					exact
					path='/login/full'
					component={ConnectedLoginStandardIdentity}
				/>
				<Route
					exact
					path='/signup/full'
					component={ConnectedCreateStandardIdentity}
				/>
				<Route exact path='/login/quick' component={ConnectedQuickLogin} />
				<Route>
					<PageNotFound />
				</Route>
			</Switch>
		</Router>
	)
}

export default Translate(Root)
