import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
	metamaskChecks,
	metamaskNetworkCheck,
	getRelayerConfig,
	execute,
} from 'actions'
import { Route, Switch, Redirect } from 'react-router'
import Dashboard from 'components/dashboard/dashboard/Dashboard'
import ConnectHoc from 'components/signin/ConnectHoc'
import {
	CreateGrantIdentity,
	CreateQuickIdentity,
	CreteFullIdentity,
	// DemoIdentity,
	LoginGrantIdentity,
	LoginStandardIdentity,
	LoginQuickIdentity,
	RecoverQuickIdentity,
} from 'components/signin/identity/Identity'
import SideSelect from 'components/signin/side-select/SideSelect'
import PageNotFound from 'components/page_not_found/PageNotFound'
import Home from 'components/signin/Home'
import JustDialog from 'components/common/dialog/JustDialog'
import { migrateLegacyWallet, removeLegacyKey } from 'services/wallet/wallet'
import Translate from 'components/translate/Translate'
import { selectAuth, selectWallet, selectLocation } from 'selectors'

const ConnectedCreateGrantIdentity = ConnectHoc(JustDialog(CreateGrantIdentity))
const ConnectedGrantLogin = ConnectHoc(JustDialog(LoginGrantIdentity))
const ConnectedCreateQuickIdentity = ConnectHoc(JustDialog(CreateQuickIdentity))
const ConnectedQuickLogin = ConnectHoc(JustDialog(LoginQuickIdentity))
const ConnectedQuickRecovery = ConnectHoc(JustDialog(RecoverQuickIdentity))
const ConnectedCreateFullIdentity = ConnectHoc(JustDialog(CreteFullIdentity))
const ConnectedLoginStandardIdentity = ConnectHoc(
	JustDialog(LoginStandardIdentity)
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
	}, [location])

	return (
		<Switch>
			<PrivateRoute auth={auth} path='/dashboard/:side' component={Dashboard} />
			<PrivateRoute auth={auth} path='/side-select' component={SideSelect} />
			{auth && <Redirect to='/side-select' />}
			<Route
				exact
				path='/'
				component={props => <ConnectedRoot {...props} noBackground />}
			/>
			<Route
				exact
				path='/identity/grant'
				component={props => (
					<ConnectedCreateGrantIdentity {...props} noBackground />
				)}
			/>
			<Route
				exact
				path='/identity/quick'
				component={props => (
					<ConnectedCreateQuickIdentity {...props} noBackground />
				)}
			/>
			<Route
				exact
				path='/login/grant'
				component={props => <ConnectedGrantLogin {...props} noBackground />}
			/>
			<Route
				exact
				path='/login/full'
				component={props => (
					<ConnectedLoginStandardIdentity {...props} noBackground />
				)}
			/>
			<Route
				exact
				path='/login/quick'
				component={props => <ConnectedQuickLogin {...props} noBackground />}
			/>
			<Route
				exact
				path='/recover/quick'
				component={props => <ConnectedQuickRecovery {...props} noBackground />}
			/>
			<Route
				exact
				path='/identity/full'
				component={props => (
					<ConnectedCreateFullIdentity {...props} noBackground />
				)}
			/>
			{/* <Route exact path="/identity/demo" component={DemoIdentity} /> */}
			<Route>
				<PageNotFound />
			</Route>
		</Switch>
	)
}

export default Translate(Root)
