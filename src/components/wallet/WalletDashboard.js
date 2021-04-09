import React, { useState, useEffect } from 'react'
import WalletSideNav from './WalletSideNav'
import TopBar from 'components/dashboard/dashboard/TopBar'
import { Route, Switch } from 'react-router'
import Account from 'components/dashboard/account/AccountInfo'
import TopUp from 'components/dashboard/deposit/TopUp'
import TopUpChangelly from 'components/dashboard/deposit/TopUpChangelly'
import {
	Drawer,
	Box,
	Hidden,
	//  Paper
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import PageNotFound from 'components/page_not_found/PageNotFound'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from 'components/dashboard/dashboard/styles'
import {
	execute,
	resolveEnsAddress,
	updatePrivilegesWarningAccepted,
} from 'actions'
import {
	t,
	selectAccountIdentityAddr,
	selectWalletPrivileges,
	selectPrivilegesWarningAccepted,
} from 'selectors'
import { useSelector } from 'react-redux'

const useStyles = makeStyles(styles)

const WalletStats = () => <Box>{'Wallet Dashboard here'}</Box>

function WalletDashboard(props) {
	const [mobileOpen, setMobileOpen] = useState(false)
	const address = useSelector(selectAccountIdentityAddr)
	const privileges = useSelector(selectWalletPrivileges)
	const privilegesWarningAccepted = useSelector(selectPrivilegesWarningAccepted)
	const showTxPrivLevelWarning = privileges <= 1 && !privilegesWarningAccepted

	const classes = useStyles()

	useEffect(() => {
		execute(resolveEnsAddress({ address }))
	}, [address])

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen)
	}

	const drawer = <WalletSideNav />

	return (
		<div className={classes.root}>
			<TopBar open={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
			<Hidden mdUp>
				<Drawer
					variant='temporary'
					anchor='left'
					open={mobileOpen}
					onClose={handleDrawerToggle}
					classes={{
						paper: classes.drawerPaper,
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
						paper: classes.drawerPaper,
					}}
				>
					{drawer}
				</Drawer>
			</Hidden>

			<main className={classes.content}>
				<div className={classes.contentInner}>
					<Box>
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
										args: [`PRIV_${privileges}_LABEL`],
									})}
								</Alert>
							</Box>
						)}

						<Switch>
							<Route exact path={'/dashboard/account'} component={Account} />
							<Route
								exact
								path={'/dashboard/topup/changelly'}
								component={TopUpChangelly}
							/>
							<Route exact path={'/dashboard/topup'} component={TopUp} />
							<Route exact path='/dashboard/' component={WalletStats} />
							<Route component={PageNotFound} />
						</Switch>
					</Box>
				</div>
			</main>
		</div>
	)
}

export default WalletDashboard
