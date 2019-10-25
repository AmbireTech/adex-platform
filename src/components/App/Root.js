import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { metamaskChecks, execute } from 'actions'
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
import JustDialog from 'components/common/dialog/JustDialog'
import { selectAuth } from 'selectors'

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

	useEffect(() => {
		execute(metamaskChecks())
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
			<Route>
				<PageNotFound />
			</Route>
		</Switch>
	)
}

export default Root
