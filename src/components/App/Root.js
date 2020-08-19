import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
	metamaskChecks,
	metamaskNetworkCheck,
	getRelayerConfig,
	execute,
	ensureQuickWalletBackup,
	updateRegistrationAllowed,
	updateEasterEggsAllowed,
	handleRedirectParams,
	handleSignupLink,
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
import PageNotFound from 'components/page_not_found/PageNotFound'
import Home from 'components/signin/Home'
import JustDialog from 'components/common/dialog/JustDialog'
import { migrateLegacyWallet, removeLegacyKey } from 'services/wallet/wallet'
import Translate from 'components/translate/Translate'
import { Button } from '@material-ui/core'
import {
	selectAuth,
	selectWallet,
	selectLocation,
	t,
	selectNewVersionAvailable,
	selectNewVersionAvailableId,
} from 'selectors'
import { getMetamaskEthereum } from 'services/smart-contracts/ethers'
import { ImportantNotifications } from './ImportantNotifications'

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

const handleLegacyWallet = async wallet => {
	const { type, email, password, authType } = wallet || {}

	if (!type && email && password && authType === 'grant') {
		await migrateLegacyWallet({ email, password })
		await removeLegacyKey({ email, password })
	}

	if (email && password && authType) {
		execute(ensureQuickWalletBackup())
	}
}

const Root = () => {
	const auth = useSelector(selectAuth)
	const wallet = useSelector(selectWallet)
	const location = useSelector(selectLocation)
	const showNotification = useSelector(selectNewVersionAvailable)
	const version = useSelector(selectNewVersionAvailableId)

	useEffect(() => {
		async function initialChecks() {
			await getMetamaskEthereum()
			execute(metamaskChecks())

			execute(getRelayerConfig())
			execute(handleRedirectParams(location.search))
			execute(handleSignupLink(location.search))
		}

		initialChecks()

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		handleLegacyWallet(wallet)
	}, [wallet])

	useEffect(() => {
		execute(metamaskNetworkCheck())
		execute(updateRegistrationAllowed(location.search))
		execute(updateEasterEggsAllowed(location.search))
	}, [location])

	return (
		<>
			{showNotification && (
				<ImportantNotifications
					title={t('RELOAD_REQUIRED')}
					message={t('SUCCESS_UPDATING_NEW_APP_VERSION', {
						args: [version],
					})}
					severity='success'
					action={
						<Button
							color='primary'
							size='large'
							variant='contained'
							onClick={() => {
								if (caches) {
									// Service worker cache should be cleared with caches.delete()
									caches.keys().then(async function(names) {
										await Promise.all(names.map(name => caches.delete(name)))
									})
								}
								window.location.reload(true)
							}}
						>
							{t('RELOAD_NOW')}
						</Button>
					}
				/>
			)}
			<Switch>
				<PrivateRoute
					auth={auth}
					path='/dashboard/:side'
					component={Dashboard}
				/>
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
		</>
	)
}

export default Translate(Root)
