import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
	onMetamaskAccountChange,
	metamaskNetworkCheck,
	metamaskAccountCheck,
	execute,
} from 'actions'
import { Route, Switch, Redirect } from 'react-router'
import Dashboard from 'components/dashboard/dashboard/Dashboard'
import ConnectHoc from 'components/signin/ConnectHoc'
import {
	CreateGrantIdentity,
	CreteFullIdentity,
	// DemoIdentity,
	LoginGrantIdentity,
	LoginStandardIdentity,
} from 'components/signin/identity/Identity'
import SideSelect from 'components/signin/side-select/SideSelect'
import PageNotFound from 'components/page_not_found/PageNotFound'
import Home from 'components/signin/Home'
import Translate from 'components/translate/Translate'
import JustDialog from 'components/common/dialog/JustDialog'
import { selectAuth, selectLocation } from 'selectors'

const ConnectedCreateGrantIdentity = ConnectHoc(JustDialog(CreateGrantIdentity))
const ConnectedGrantLogin = ConnectHoc(JustDialog(LoginGrantIdentity))
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

const Root = () => {
	const auth = useSelector(selectAuth)
	const location = useSelector(selectLocation)

	const metamaskChecks = async () => {
		execute(metamaskNetworkCheck())
		execute(metamaskAccountCheck())
		if (window.ethereum) {
			window.ethereum.on('accountsChanged', accounts => {
				console.log('acc changed', accounts[0])
				execute(onMetamaskAccountChange(accounts[0]))
			})
			window.ethereum.on('networkChanged', network => {
				console.log('networkChanged', network)
				execute(metamaskNetworkCheck({ id: network }))
			})
		}
	}

	useEffect(() => {
		metamaskChecks()
	}, [])
	return (
		<Switch>
			<PrivateRoute auth={auth} path='/dashboard/:side' component={Dashboard} />
			<PrivateRoute auth={auth} path='/side-select' component={SideSelect} />
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
				path='/identity/full'
				component={props => (
					<ConnectedCreateFullIdentity {...props} noBackground />
				)}
			/>
			{/* <Route exact path="/identity/demo" component={DemoIdentity} /> */}
			<Route component={PageNotFound} />
		</Switch>
	)
}

export default Translate(Root)
