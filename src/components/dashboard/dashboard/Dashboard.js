import React, { useState, useEffect } from 'react'
import SideNav from './SideNav'
import TopBar from './TopBar'
import { Route, Switch } from 'react-router'
import Campaign from 'components/dashboard/containers/Campaign'
import DashboardStats from 'components/dashboard/containers/DashboardStats'
import Unit from 'components/dashboard/containers/Unit'
import Slot from 'components/dashboard/containers/Slot'
import Items from 'components/dashboard/containers/Items'
// import Transactions from 'components/dashboard/containers/Transactions'
import {
	AdUnit as AdUnitModel,
	AdSlot as AdSlotModel,
	Campaign as CampaignModel,
} from 'adex-models'
import Account from 'components/dashboard/account/AccountInfo'
import {
	NewUnitDialog,
	NewCampaignDialog,
	NewSlotDialog,
} from 'components/dashboard/forms/items/NewItems'
import campaignsLoop from 'services/store-data/campaigns'
import statsLoop from 'services/store-data/account'
import {
	SORT_PROPERTIES_ITEMS,
	FILTER_PROPERTIES_ITEMS,
	FILTER_PROPERTIES_CAMPAIGN,
	SORT_PROPERTIES_CAMPAIGN,
} from 'constants/misc'
import Drawer from '@material-ui/core/Drawer'
import Hidden from '@material-ui/core/Hidden'
import PageNotFound from 'components/page_not_found/PageNotFound'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import {
	updateNav,
	getAllItems,
	updateAccountSettings,
	updateAccountAnalytics,
	execute,
} from 'actions'
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
		<Items
			header={t('ALL_CAMPAIGNS')}
			viewModeId='rowsViewCampaigns'
			itemType={'Campaign'}
			objModel={CampaignModel}
			sortProperties={SORT_PROPERTIES_CAMPAIGN}
			uiStateId='campaigns'
			filterProperties={FILTER_PROPERTIES_CAMPAIGN}
		/>
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
		<Items
			header={t('ALL_UNITS')}
			viewModeId='rowsViewUnits'
			itemType={'AdUnit'}
			objModel={AdUnitModel}
			sortProperties={SORT_PROPERTIES_ITEMS}
			filterProperties={FILTER_PROPERTIES_ITEMS}
			uiStateId='units'
		/>
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
		<Items
			header={t('ALL_SLOTS')}
			viewModeId='rowsViewSlots'
			itemType={'AdSlot'}
			objModel={AdSlotModel}
			sortProperties={SORT_PROPERTIES_ITEMS}
			filterProperties={FILTER_PROPERTIES_ITEMS}
			uiStateId='slots'
		/>
	</>
)

function Dashboard(props) {
	const [mobileOpen, setMobileOpen] = useState(false)

	const { match, classes, theme } = props
	const { side } = match.params

	useEffect(() => {
		execute(updateNav('side', side))
		execute(getAllItems())
		execute(updateAccountSettings())
		execute(updateAccountAnalytics())
		campaignsLoop.start()
		statsLoop.start()

		return () => {
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
					anchor={theme.direction === 'rtl' ? 'right' : 'left'}
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
							component={props => <Campaign {...props} />}
						/>
						<Route
							exact
							path='/dashboard/advertiser/AdUnit/:itemId'
							component={props => <Unit {...props} />}
						/>
						<Route
							exact
							path='/dashboard/publisher/slots'
							component={AdSlots}
						/>
						<Route
							exact
							path='/dashboard/publisher/AdSlot/:itemId'
							component={props => <Slot {...props} />}
						/>
						<Route
							exact
							path={'/dashboard/:side/account'}
							component={props => <Account {...props} />}
						/>
						{/* <Route
								auth={this.props.auth}
								exact
								path={'/dashboard/:side/transactions'}
								component={props => <Transactions {...props} />}
							/> */}
						<Route
							exact
							path='/dashboard/:side'
							component={props => <DashboardStats {...props} />}
						/>
						<Route component={props => <PageNotFound {...props} />} />
					</Switch>
				</div>
			</main>
		</div>
	)
}

export default withStyles(styles, { withTheme: true })(Dashboard)
