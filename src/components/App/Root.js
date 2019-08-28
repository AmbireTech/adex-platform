import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { Route, Switch, Redirect } from 'react-router-dom'
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
// import { getSig } from 'services/auth/auth'
import { AUTH_TYPES } from 'constants/misc'
import { logOut } from 'services/store-data/auth'
import JustDialog from 'components/common/dialog/JustDialog'
import { getEthers } from 'services/smart-contracts/ethers'

const ConnectedCreateGrantIdentity = ConnectHoc(JustDialog(CreateGrantIdentity))
const ConnectedGrantLogin = ConnectHoc(JustDialog(LoginGrantIdentity))
const ConnectedCreateFullIdentity = ConnectHoc(JustDialog(CreteFullIdentity))
const ConnectedLoginStandardIdentity = ConnectHoc(
	JustDialog(LoginStandardIdentity)
)
const ConnectedRoot = ConnectHoc(Home)

function PrivateRoute({ component: Component, auth, ...other }) {
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

class Root extends Component {
	onMetamaskAccountChange = async accountAddress => {
		const { account } = this.props
		const { authType } = account.wallet
		if (authType === AUTH_TYPES.METAMASK.name || !authType) {
			logOut()
		}
	}

	getNetworkId = async () => {
		const { provider } = await getEthers(AUTH_TYPES.METAMASK.name)
		const networkId = (await provider.getNetwork()).chainId

		return networkId
	}

	onMetamaskNetworkChanged = async id => {
		const { actions, t } = this.props

		const networkId = id || (await this.getNetworkId())

		const networks = {
			1: { name: 'Mainnet', for: 'production' },
			5: { name: 'Georli', for: 'development' },
		}

		const network = networks[networkId]

		if (process.env.NODE_ENV !== network.for) {
			actions.addToast({
				type: 'warning',
				// action,
				label: t('WATNING_METAMASK_INVALID_NETWORK', {
					args: [network.name],
				}),
				top: true,
				unclosable: true,
				timeout: 30 * 24 * 60 * 1000,
			})
		} else {
			actions.addToast({
				type: 'accept',
				// action,
				label: t('METAMASK_CORRECT_NETWORK'),
				timeout: 0 * 1000,
			})
		}
	}

	componentDidCatch(error, info) {
		// TODO: catch errors
	}

	componentWillUnmount() {}

	componentDidMount() {
		this.onMetamaskNetworkChanged()
		if (window.ethereum) {
			window.ethereum.on('accountsChanged', accounts => {
				console.log('acc changed', accounts[0])
				this.onMetamaskAccountChange(accounts[0])
			})
			window.ethereum.on('networkChanged', network => {
				console.log('networkChanged', network)
				this.onMetamaskNetworkChanged()
			})
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		// TODO: check if computedMatch or language change need to update
		const authChanged = this.props.auth !== nextProps.auth
		const locationChanged =
			JSON.stringify(this.props.location) !== JSON.stringify(nextProps.location)

		return authChanged || locationChanged
	}

	render() {
		return (
			<Switch>
				<PrivateRoute
					auth={this.props.auth}
					path='/dashboard/:side'
					component={Dashboard}
				/>
				<PrivateRoute
					auth={this.props.auth}
					path='/side-select'
					component={SideSelect}
				/>
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
}

Root.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
	const { persist } = state
	const { account } = persist
	const { wallet, identity } = account

	const hasAuth =
		!!wallet &&
		!!wallet.address &&
		!!wallet.authSig &&
		!!wallet.authType &&
		!!identity.address

	return {
		account: account,
		auth: hasAuth,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(Root))
