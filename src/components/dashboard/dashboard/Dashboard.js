import React from 'react'
import SideNav from './SideNav'
import TopBar from './TopBar'
import { Route, Switch } from 'react-router'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Campaign from 'components/dashboard/containers/Campaign'
import DashboardStats from 'components/dashboard/containers/DashboardStats'
import Unit from 'components/dashboard/containers/Unit'
import Slot from 'components/dashboard/containers/Slot'
import Items from 'components/dashboard/containers/Items'
import isEqual from 'lodash.isequal'
// import Transactions from 'components/dashboard/containers/Transactions'
import {
	AdUnit as AdUnitModel,
	AdSlot as AdSlotModel,
	Campaign as CampaignModel,
} from 'adex-models'
import Account from 'components/dashboard/account/AccountInfo'
import Translate from 'components/translate/Translate'
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
class Dashboard extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			drawerActive: false,
			drawerPinned: false,
			sidebarPinned: false,
			mobileOpen: false,
		}
	}

	handleDrawerToggle = () => {
		this.setState({ mobileOpen: !this.state.mobileOpen })
	}

	componentWillUnmount() {
		campaignsLoop.stop()
		statsLoop.stop()
	}

	componentDidMount() {
		const { actions } = this.props

		actions.updateNav('side', this.props.match.params.side)
		actions.getAllItems()
		actions.updateAccountSettings()
		actions.updateAccountAnalytics()
		campaignsLoop.start()
		statsLoop.start()
	}

	shouldComponentUpdate(nextProps) {
		const should = isEqual(nextProps.match, this.props.match)
		return should
	}

	componentDidUpdate(nextProps) {
		if (nextProps.match.params.side !== this.props.match.params.side) {
			this.props.actions.updateNav('side', nextProps.match.params.side)
		}
	}

	toggleDrawerActive = () => {
		this.setState({ drawerActive: !this.state.drawerActive })
	}

	toggleDrawerPinned = () => {
		this.setState({ drawerPinned: !this.state.drawerPinned })
	}

	toggleSidebar = () => {
		this.setState({ sidebarPinned: !this.state.sidebarPinned })
	}

	renderAdUnits = () => {
		return (
			<>
				<NewUnitDialog
					fabButton
					variant='extended'
					color='secondary'
					btnLabel='NEW_UNIT'
				/>
				<Items
					header={this.props.t('ALL_UNITS')}
					viewModeId='rowsViewUnits'
					itemType={'AdUnit'}
					objModel={AdUnitModel}
					sortProperties={SORT_PROPERTIES_ITEMS}
					filterProperties={FILTER_PROPERTIES_ITEMS}
					uiStateId='units'
				/>
			</>
		)
	}

	renderCampaigns = () => {
		return (
			<>
				<NewCampaignDialog
					fabButton
					variant='extended'
					accent
					color='secondary'
					btnLabel='NEW_CAMPAIGN'
				/>
				<Items
					header={this.props.t('ALL_CAMPAIGNS')}
					viewModeId='rowsViewCampaigns'
					itemType={'Campaign'}
					objModel={CampaignModel}
					sortProperties={SORT_PROPERTIES_CAMPAIGN}
					uiStateId='campaigns'
					filterProperties={FILTER_PROPERTIES_CAMPAIGN}
				/>
			</>
		)
	}

	renderAdSlots = () => {
		return (
			<>
				<NewSlotDialog
					fabButton
					variant='extended'
					accent
					color='secondary'
					btnLabel='NEW_SLOT'
				/>
				<Items
					header={this.props.t('ALL_SLOTS')}
					viewModeId='rowsViewSlots'
					itemType={'AdSlot'}
					objModel={AdSlotModel}
					sortProperties={SORT_PROPERTIES_ITEMS}
					filterProperties={FILTER_PROPERTIES_ITEMS}
					uiStateId='slots'
				/>
			</>
		)
	}

	handleDrawerOpen = () => {
		this.setState({ open: true })
	}

	handleDrawerClose = () => {
		this.setState({ open: false })
	}

	render() {
		const { classes, theme, match } = this.props
		const side = match.params.side

		const drawer = (
			<div>
				{/* <div className={classes.toolbar}>
                    <SideSwitch side={side} t={this.props.t} />
                </div>
                <Divider /> */}
				<SideNav side={side} />
			</div>
		)

		return (
			<div className={classes.root}>
				<TopBar
					side={side}
					open={this.state.open}
					handleDrawerToggle={this.handleDrawerToggle}
				/>
				<Hidden mdUp>
					<Drawer
						variant='temporary'
						anchor={theme.direction === 'rtl' ? 'right' : 'left'}
						open={this.state.mobileOpen}
						onClose={this.handleDrawerToggle}
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
								component={this.renderCampaigns}
							/>
							<Route
								exact
								path='/dashboard/advertiser/units'
								component={this.renderAdUnits}
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
								path='/dashboard/publisher/channels'
								component={this.renderChannels}
							/>
							<Route
								exact
								path='/dashboard/publisher/slots'
								component={this.renderAdSlots}
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
}

Dashboard.propTypes = {
	actions: PropTypes.object.isRequired,
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

export default connect(
	null,
	mapDispatchToProps
)(Translate(withStyles(styles, { withTheme: true })(Dashboard)))
