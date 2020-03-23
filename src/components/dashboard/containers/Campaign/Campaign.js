import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import ItemHoc from 'components/dashboard/containers/ItemHoc'
import { AdUnitsTable } from 'components/dashboard/containers/Tables'
import Translate from 'components/translate/Translate'
import Button from '@material-ui/core/Button'
import { Campaign as CampaignModel } from 'adex-models'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { CampaignProps } from 'components/dashboard/containers/ItemCommon'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import AppBar from '@material-ui/core/AppBar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Anchor from 'components/common/anchor/anchor'
import CampaignStatsDoughnut from 'components/dashboard/charts/campaigns/CampaignStatsDoughnut'
import CampaignStatsBreakdownTable from 'components/dashboard/containers/Tables/CampaignStatsBreakdownTable'
import { Receipt } from 'components/dashboard/containers/Receipt'
// import UnitTargets from 'components/dashboard/containers/UnitTargets'
// import UnitTargets from 'components/dashboard/containers/UnitTargets'
const VIEW_MODE = 'campaignRowsView'

export class Campaign extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {
			tabIndex: 0,
			statistics: {},
		}
	}

	handleTabChange = (event, index) => {
		this.setState({ tabIndex: index })
	}

	CampaignActions = ({ campaign, actions, t }) => {
		const humanFriendlyName = campaign.status.humanFriendlyName
		return (
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Button
						variant='contained'
						color='secondary'
						size='large'
						onClick={() => {
							actions.closeCampaign({ campaign })
						}}
						disabled={humanFriendlyName === 'Closed'}
					>
						{t('BTN_CLOSE_CAMPAIGN')}
					</Button>
				</Grid>
			</Grid>
		)
	}

	render() {
		const {
			t,
			classes,
			item,
			// handleChange,
			// activeFields,
			// isDemo,
			actions,
			history,
			// ...rest
		} = this.props
		const { tabIndex } = this.state
		const campaign = new CampaignModel(item)
		const status = (campaign.status || {}).name
		const humanFriendlyName = campaign.status.humanFriendlyName
		const leader = campaign.spec.validators[0]
		const follower = campaign.spec.validators[1]
		return (
			<div>
				<CampaignProps
					item={campaign}
					t={t}
					rightComponent={
						// <UnitTargets
						// 	{...rest}
						// 	targets={campaign.targeting}
						// 	t={t}
						// 	subHeader={t('CAMPAIGN_TARGETING')}
						// />
						(status === 'Ready' ||
							status === 'Active' ||
							status === 'Withdraw' ||
							status === 'Unhealthy') && (
							<this.CampaignActions
								campaign={campaign}
								t={t}
								actions={actions}
								history={history}
							/>
						)
					}
				/>
				<div>
					<AppBar position='static' color='default' className={classes.appBar}>
						<Tabs
							value={tabIndex}
							onChange={this.handleTabChange}
							scrollButtons='auto'
							indicatorColor='primary'
							textColor='primary'
						>
							<Tab label={t('STATISTICS')} />
							<Tab label={t('CAMPAIGN_UNITS')} />
							<Tab label={t('VALIDATORS')} />
							{(humanFriendlyName === 'Closed' ||
								humanFriendlyName === 'Completed') && (
								<Tab label={t('RECEIPT')} />
							)}
						</Tabs>
					</AppBar>
					<div style={{ marginTop: 10 }}>
						{tabIndex === 0 && (
							<Grid container spacing={2}>
								<Box clone order={{ xs: 2, md: 2, lg: 1 }}>
									<Grid item lg={8} md={12} xs={12}>
										<CampaignStatsBreakdownTable campaignId={item.id} />
									</Grid>
								</Box>
								<Box clone order={{ xs: 1, md: 1, lg: 2 }}>
									<Grid item lg={4} md={12} xs={12}>
										<CampaignStatsDoughnut campaignId={item.id} />
									</Grid>
								</Box>
							</Grid>
						)}
						{tabIndex === 1 && (
							<AdUnitsTable campaignId={campaign.id} noClone />
						)}
						{tabIndex === 2 && (
							<List>
								<Anchor
									target='_blank'
									href={`${leader.url}/channel/${campaign.id}/status`}
								>
									<ListItem button>
										<ListItemText primary={t('LEADER_STATUS')} />
									</ListItem>
								</Anchor>
								<Anchor
									target='_blank'
									href={`${leader.url}/channel/${campaign.id}/last-approved?withHeartbeat=true`}
								>
									<ListItem button>
										<ListItemText primary={t('LEADER_LAST_APPROVED')} />
									</ListItem>
								</Anchor>
								<Anchor
									target='_blank'
									href={`${follower.url}/channel/${campaign.id}/status`}
								>
									<ListItem button>
										<ListItemText primary={t('FOLLOWER_STATUS')} />
									</ListItem>
								</Anchor>
								<Anchor
									target='_blank'
									href={`${follower.url}/channel/${campaign.id}/last-approved?withHeartbeat=true`}
								>
									<ListItem button>
										<ListItemText primary={t('FOLLOWER_LAST_APPROVED')} />
									</ListItem>
								</Anchor>
							</List>
						)}
						{tabIndex === 3 && <Receipt itemId={campaign.id} />}
					</div>
				</div>
			</div>
		)
	}
}

Campaign.propTypes = {
	actions: PropTypes.object.isRequired,
	units: PropTypes.object.isRequired,
	rowsView: PropTypes.bool.isRequired,
	item: PropTypes.object.isRequired,
}

function mapStateToProps(state, ownProps) {
	const { persist } = state
	// let memory = state.memory
	return {
		units: persist.items['AdUnit'],
		rowsView: !!persist.ui.global[VIEW_MODE],
		objModel: CampaignModel,
		itemType: 'Campaign',
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

const CampaignItem = ItemHoc(withStyles(styles)(Campaign))
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(CampaignItem))
