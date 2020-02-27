import React, { useState, useEffect, Fragment } from 'react'
import SideNav from './SideNav'
import TopBar from './TopBar'
import { Route, Switch } from 'react-router'
import Campaign, {
	CampaignReceipt,
} from 'components/dashboard/containers/Campaign'
import DashboardStats from 'components/dashboard/containers/DashboardStats'
import Unit from 'components/dashboard/containers/Unit'
import Slot from 'components/dashboard/containers/Slot'
import Account from 'components/dashboard/account/AccountInfo'
import {
	NewUnitDialog,
	NewCampaignDialog,
	NewSlotDialog,
} from 'components/dashboard/forms/items/NewItems'
import {
	CampaignsTable,
	AdSlotsTable,
	AdUnitsTable,
} from 'components/dashboard/containers/Tables'
import { campaignsLoop } from 'services/store-data/campaigns'
import statsLoop from 'services/store-data/account'
import {
	analyticsLoop,
	analyticsCampaignsLoop,
} from 'services/store-data/analytics'
import Drawer from '@material-ui/core/Drawer'
import Box from '@material-ui/core/Box'
import Alert from '@material-ui/lab/Alert'
import Hidden from '@material-ui/core/Hidden'
import PageNotFound from 'components/page_not_found/PageNotFound'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import {
	updateNav,
	getAllItems,
	updateSlotsDemandThrottled,
	execute,
	resolveEnsAddress,
	updatePrivilegesWarningAccepted,
	updateAccountIdentityData,
} from 'actions'
import {
	t,
	selectAccountIdentityAddr,
	selectWalletPrivileges,
	selectPrivilegesWarningAccepted,
} from 'selectors'
import { useSelector } from 'react-redux'
import GetttingStarted from '../getting-started/GettingStarted'

const Campaigns = () => {
	const privileges = useSelector(selectWalletPrivileges)
	const disabled = privileges <= 1
	return (
		<Fragment>
			<NewCampaignDialog
				disabled={disabled}
				fabButton
				variant='extended'
				accent
				color='secondary'
				btnLabel='NEW_CAMPAIGN'
			/>
			<CampaignsTable />
		</Fragment>
	)
}

const AdUnits = () => (
	<>
		<NewUnitDialog
			fabButton
			variant='extended'
			color='secondary'
			btnLabel='NEW_UNIT'
		/>
		<AdUnitsTable />
	</>
)

const AdSlots = () => (
	<>
		<NewSlotDialog
			fabButton
			variant='extended'
			accent
			color='secondary'
			btnLabel='NEW_SLOT'
		/>
		<AdSlotsTable />
	</>
)

const useStyles = makeStyles(styles)

function Dashboard(props) {
	const [mobileOpen, setMobileOpen] = useState(false)
	const [dataLoaded, setDataLoaded] = useState(false)
	const address = useSelector(selectAccountIdentityAddr)
	const privileges = useSelector(selectWalletPrivileges)
	const privilegesWarningAccepted = useSelector(selectPrivilegesWarningAccepted)
	const showTxPrivLevelWarning = privileges <= 1 && !privilegesWarningAccepted

	const { match } = props
	const { side } = match.params
	const classes = useStyles()

	useEffect(() => {
		execute(resolveEnsAddress({ address }))
	})

	useEffect(() => {
		async function updateInitialData() {
			execute(updateAccountIdentityData())
			execute(updateSlotsDemandThrottled())
			execute(updateNav('side', side))
			execute(getAllItems())

			// NOTE: await for stats (withBalance.all)
			// needed for publisher analytics
			await statsLoop.start()
			analyticsLoop.start()

			//NOTE: await fo campaign analytics first
			// because of the campaigns table data update fix
			await analyticsCampaignsLoop.start()
			campaignsLoop.start()
			setDataLoaded(true)
		}

		updateInitialData()

		return () => {
			analyticsLoop.stop()
			analyticsCampaignsLoop.stop()
			campaignsLoop.stop()
			statsLoop.stop()
		}
	}, [side])

	useEffect(() => {}, [match, mobileOpen])
	useEffect(() => {
		execute(updateNav('side', side))
	}, [side])

	const handleDrawerToggle = () => {
		setMobileOpen(!mobileOpen)
	}

	const drawer = <SideNav side={side} />

	return (
		<div className={classes.root}>
			<TopBar
				side={side}
				open={mobileOpen}
				handleDrawerToggle={handleDrawerToggle}
			/>
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
					<div className={classes.toolbar} />
					{showTxPrivLevelWarning && (
						<Box mb={2} p={1}>
							<Alert
								variant='outlined'
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
					{dataLoaded && <GetttingStarted side={side} />}
					<Switch>
						<Route
							exact
							path='/dashboard/advertiser/campaigns'
							component={Campaigns}
						/>
						<Route
							exact
							path='/dashboard/advertiser/units'
							component={AdUnits}
						/>
						<Route
							exact
							path='/dashboard/advertiser/Campaign/:itemId'
							component={Campaign}
						/>
						<Route
							exact
							path='/dashboard/advertiser/receipts'
							component={CampaignReceipt}
						/>
						<Route
							exact
							path='/dashboard/advertiser/Campaign/receipt/:itemId'
							component={CampaignReceipt}
						/>
						<Route
							exact
							path='/dashboard/advertiser/AdUnit/:itemId'
							component={Unit}
						/>
						<Route
							exact
							path='/dashboard/publisher/slots'
							component={AdSlots}
						/>
						<Route
							exact
							path='/dashboard/publisher/AdSlot/:itemId'
							component={Slot}
						/>
						<Route
							exact
							path={'/dashboard/:side/account'}
							component={Account}
						/>
						{/* <Route
								auth={this.props.auth}
								exact
								path={'/dashboard/:side/transactions'}
								component={props => <Transactions {...props} />}
							/> */}
						<Route exact path='/dashboard/:side' component={DashboardStats} />
						<Route component={PageNotFound} />
					</Switch>
				</div>
			</main>
		</div>
	)
}

export default Dashboard
