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
	DemoIdentity,
	LoginGrantIdentity
} from 'components/signin/identity/Identity'
import AuthSelect from 'components/signin/auth-select/AuthSelect'
import SideSelect from 'components/signin/side-select/SideSelect'
import PageNotFound from 'components/page_not_found/PageNotFound'
import Translate from 'components/translate/Translate'
import scActions from 'services/smart-contracts/actions'
import { getSig } from 'services/auth/auth'
import { AUTH_TYPES } from 'constants/misc'
import { logOut } from 'services/store-data/auth'
import checkGasData from 'services/store-data/gas'
import { cfg, getWeb3, web3Utils } from 'services/smart-contracts/ADX'

const { getAccountMetamask } = scActions

const ConnectedCreateGrantIdentity = ConnectHoc(CreateGrantIdentity)
const ConnectedGrantLogin = ConnectHoc(LoginGrantIdentity)
const ConnectedAuthSelect = ConnectHoc(AuthSelect)
const ConnectedCreateFullIdentity = ConnectHoc(CreteFullIdentity)

function PrivateRoute({ component: Component, auth, ...other }) {
	return (
		<Route
			{...other}
			render={(props) => auth === true //|| true
				? <Component {...props} />
				: <Redirect to={{ pathname: '/', state: { from: props.location } }} />}
		/>
	)
}

class Root extends Component {

	checkForMetamaskAccountChange = () => {
		let acc = this.props.account
		if (acc._authType === AUTH_TYPES.METAMASK.name) {

			getAccountMetamask()
				.then(({ addr, mode }) => {
					addr = (addr || '').toLowerCase()
					if (addr && acc._addr && acc._authType !== undefined) {
						let accSigCheck = getSig({ addr: acc._addr, mode: acc._authType })
						let mmAddrSigCheck = getSig({ addr: addr, mode: AUTH_TYPES.METAMASK.name })
						if (!!mmAddrSigCheck && !!accSigCheck && (mmAddrSigCheck === accSigCheck)) {
							return // user authenticated and not changed
						} else {
							// logout on metamask addr change
							logOut()
						}
					} else {
						logOut()
					}
				})
		}
	}

	onMetamaskNetworkChanged = () => {
		if (process.env.NODE_ENV !== 'production') {
			return
		}

		let acc = this.props.account
		if (acc._authType === AUTH_TYPES.METAMASK.name || !acc._authType) {
			getWeb3('metamask')
				.then(({ web3 }) => {
					console.log(web3)
					web3.eth.net.getNetworkType()
						.then((currentNetwork) => {
							if (currentNetwork != 'main') {
								this.props.actions.addToast({
									type: 'warning',
									// action,
									label: 'WATNING_NO_MAINNET',
									top: true,
									unclosable: true,
									timeout: 30 * 24 * 60 * 1000
								})
							}
							// console.log('getNetwork currentNetwork', currentNetwork)
						})
						.catch((err) => {
							// console.log('getNetwork err', err)
						})
				})
		}
	}

	componentDidCatch(error, info) {
		// TODO: catch errors
	}

	componentWillUnmount() {
		// checkGasData.stop()
	}

	componentWillMount() {
		// checkGasData.start()
		// this.checkForMetamaskAccountChange()
		// this.onMetamaskNetworkChanged()

		// if (window.ethereum) {
		// 	window.ethereum.on('accountsChanged', (accounts) => {
		// 		console.log('acc changed', accounts[0])
		// 		this.checkForMetamaskAccountChange()
		// 	})
		// 	window.ethereum.on('networkChanged', (network) => {
		// 		console.log('networkChanged', network)
		// 		this.onMetamaskNetworkChanged()
		// 	})
		// }
	}

	shouldComponentUpdate(nextProps, nextState) {
		// TODO: check if computedMatch or language change need to update
		const authChanged = this.props.auth !== nextProps.auth
		const locationChanged =
			JSON.stringify(this.props.location.pathname) !== 
			JSON.stringify(nextProps.location.pathname)

		return authChanged || locationChanged
	}

	render() {
		return (
			<Switch >
				<PrivateRoute auth={this.props.auth} path="/dashboard/:side" component={Dashboard} />
				<PrivateRoute auth={this.props.auth} path="/side-select" component={SideSelect} />
				<Route exact path="/" component={(props) => <ConnectedAuthSelect {...props} noBackground />} />
				<Route exact path="/identity/grant" component={(props) => <ConnectedCreateGrantIdentity {...props} noBackground />} />
				<Route exact path="/login/grant" component={(props) => <ConnectedGrantLogin {...props} noBackground />} />
				<Route exact path="/identity/full" component={(props) => <ConnectedCreateFullIdentity {...props} noBackground />} />
				<Route exact path="/identity/demo" component={DemoIdentity} />
				<Route component={PageNotFound} />
			</Switch >
		)
	}
}

Root.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
	const { persist } = state
	const { account } = persist
	const { wallet, identity } = account

	const hasAuth = !!wallet
		&& !!wallet.address
		&& !!wallet.authSig
		&& !!wallet.authType
		&& !!identity.address

	return {
		account: account,
		auth: hasAuth
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(Root))

