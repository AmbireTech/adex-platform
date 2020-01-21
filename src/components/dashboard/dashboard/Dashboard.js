import React, { useState, useEffect } from 'react'
import SideNav from './SideNav'
import TopBar from './TopBar'
import { Route, Switch } from 'react-router'
import Campaign from 'components/dashboard/containers/Campaign'
import DashboardStats from 'components/dashboard/containers/DashboardStats'
import Unit from 'components/dashboard/containers/Unit'
import Slot from 'components/dashboard/containers/Slot'
import Items from 'components/dashboard/containers/Items'
import Account from 'components/dashboard/account/AccountInfo'
import {
	NewUnitDialog,
	NewCampaignDialog,
	NewSlotDialog,
} from 'components/dashboard/forms/items/NewItems'
import {
	campaignsLoop,
	campaignsLoopStats,
} from 'services/store-data/campaigns'
import statsLoop from 'services/store-data/account'
import {
	analyticsLoop,
	analyticsCampaignsLoop,
} from 'services/store-data/analytics'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import PageNotFound from 'components/page_not_found/PageNotFound'
import { makeStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { updateNav, getAllItems, execute } from 'actions'
import { t } from 'selectors'

const Campaigns = () => (
	<>
		<NewCampaignDialog
			fabButton
			variant='extended'
			accent
			color='secondary'
			btnLabel='NEW_CAMPAIGN'
		/>
		<Items header={t('ALL_CAMPAIGNS')} itemType={'Campaign'} />
	</>
)

const AdUnits = () => (
	<>
		<NewUnitDialog
			fabButton
			variant='extended'
			color='secondary'
			btnLabel='NEW_UNIT'
		/>
		<Items header={t('ALL_UNITS')} itemType={'AdUnit'} />
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
		<Items header={t('ALL_SLOTS')} itemType={'AdSlot'} />
	</>
)

const useStyles = makeStyles(styles)

function Dashboard(props) {
	const [mobileOpen, setMobileOpen] = useState(false)

	const { match } = props
	const { side } = match.params
	const classes = useStyles()

	useEffect(() => {
		execute(updateNav('side', side))
		execute(getAllItems())
		analyticsLoop.start()
		analyticsCampaignsLoop.start()
		campaignsLoop.start()
		campaignsLoopStats.start()
		statsLoop.start()

		return () => {
			analyticsLoop.stop()
			analyticsCampaignsLoop.stop()
			campaignsLoop.stop()
			campaignsLoopStats.stop()
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
