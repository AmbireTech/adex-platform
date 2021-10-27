import React, { useState, useEffect } from 'react'
import WalletSideNav from './WalletSideNav'
import TopBar from './WalletTopBar'
import { Route, Switch } from 'react-router'
import Account from 'components/dashboard/account/AccountInfo'
import {
	Drawer,
	Box,
	Hidden,
	//  Paper
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import PageNotFound from 'components/page_not_found/PageNotFound'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import {
	execute,
	resolveEnsAddress,
	updatePrivilegesWarningAccepted,
	loadWalletAccountData,
	stopWalletAccountDataUpdate,
} from 'actions'
import {
	t,
	selectAccountIdentityAddr,
	selectWalletPrivileges,
	selectPrivilegesWarningAccepted,
	selectDebugIdentity,
} from 'selectors'
import { useSelector } from 'react-redux'
import clsx from 'clsx'
import WalletStats from './WalletStats'
import WalletPrivileges from './WalletPrivileges'

const walletStyles = theme => {
	return {
		root: {
			overflow: 'visible',
		},
		content: {
			'&::before': {
				backgroundSize: 'cover',
				backgroundPosition: 'center',
				backgroundRepeat: 'no-repeat',
				content: '""',
				position: 'absolute',
				top: -69,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundImage: `url(${require('resources/wallet/background.jpg')})`,
				opacity: 0,
				zIndex: -1,
			},
		},
		drawerPaper: {
			backgroundColor: theme.palette.background.default,
			borderRight: 0,
			borderLeft: 0,
		},
	}
}

const useStyles = makeStyles(styles)
const useWalletStyles = makeStyles(walletStyles)

function WalletDashboard(props) {
	const [mobileOpen, setMobileOpen] = useState(false)
	const address = useSelector(selectAccountIdentityAddr)
	const privileges = useSelector(selectWalletPrivileges)
	const privilegesWarningAccepted = useSelector(selectPrivilegesWarningAccepted)
	const showTxPrivLevelWarning =
		privileges !== true && !privilegesWarningAccepted
	const { debugIdentityAddr } = useSelector(selectDebugIdentity)

	const classes = useStyles()
	const walletClasses = useWalletStyles()

	useEffect(() => {
		async function updateInitialData() {
			execute(loadWalletAccountData())
		}

		updateInitialData()

		return () => {
			execute(stopWalletAccountDataUpdate())
		}
	}, [])

	useEffect(() => {
		execute(resolveEnsAddress({ address }))
	}, [address])

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen)
	}

	const drawer = <WalletSideNav />

	return (
		<div className={clsx(classes.root, walletClasses.root)}>
			<TopBar open={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
			<Hidden mdUp>
				<Drawer
					variant='temporary'
					anchor='left'
					open={mobileOpen}
					onClose={handleDrawerToggle}
					classes={{
						paper: clsx(classes.drawerPaper, walletClasses.drawerPaper),
					}}
					ModalProps={{
						keepMounted: true, // Better open performance on mobile.
					}}
				>
					{drawer}
				</Drawer>
			</Hidden>
			<Hidden smDown implementation='css'>
				<Drawer
					variant='permanent'
					open
					classes={{
						paper: clsx(classes.drawerPaper, walletClasses.drawerPaper),
					}}
				>
					{drawer}
				</Drawer>
			</Hidden>

			<main className={clsx(classes.content, walletClasses.content)}>
				<div className={classes.contentInner}>
					<Box>
						{/* <Box mb={2}>
							<Alert variant='filled' severity='info'>
								{t('BETA_WARNING_MSG')}
							</Alert>
						</Box> */}
						{showTxPrivLevelWarning && (
							<Box mb={2}>
								<Alert
									variant='filled'
									severity='info'
									onClose={() => {
										execute(updatePrivilegesWarningAccepted(true))
									}}
								>
									{t('PRIVILEGES_LEVEL_WARNING_MSG', {
										args: [
											`PRIV_${(privileges || '')
												.toString()
												.toUpperCase()}_LABEL`,
										],
									})}
								</Alert>
							</Box>
						)}

						{debugIdentityAddr && (
							<Box mb={2}>
								<Alert variant='filled' severity='warning'>
									{`Debugging identity: ${debugIdentityAddr}`}
								</Alert>
							</Box>
						)}

						<Switch>
							<Route exact path={'/dashboard/account'} component={Account} />
							<Route exact path='/dashboard/' component={WalletStats} />
							<Route
								exact
								path={'/dashboard/privileges'}
								component={WalletPrivileges}
							/>
							<Route component={PageNotFound} />
						</Switch>
					</Box>
				</div>
			</main>
		</div>
	)
}

export default WalletDashboard
