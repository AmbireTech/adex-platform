import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Grid from '@material-ui/core/Grid'
import Box from '@material-ui/core/Box'
import ItemHoc from 'components/dashboard/containers/ItemHoc'
import EnhancedTable from 'components/dashboard/containers/Tables/EnhancedTable'
import Translate from 'components/translate/Translate'
import Button from '@material-ui/core/Button'
import { AdUnit as AdUnitModel, Campaign as CampaignModel } from 'adex-models'
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
import { selectMainToken } from 'selectors'
import MUIDataTableEnchanced from 'components/dashboard/containers/Tables/MUIDataTableEnchanced'
import CampaignStatsDoughnut from 'components/dashboard/charts/campaigns/CampaignStatsDoughnut'
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

	getTableData = (campaingAnalytics, campaignId) => {
		//IMPRESSION.byChannelStats[""0x80b2d99df436d53660737d51b8a130d053279b46cb2ac9ba91dd79b34dab6687""]
		const results = []
		const campaign = type => campaingAnalytics[type].byChannelStats[campaignId]
		const imprStats = campaign('IMPRESSION').reportChannelToHostname
		const clickStats = campaign('CLICK').reportChannelToHostname
		const earnStats = campaign('IMPRESSION').reportChannelToHostnamePay
		Object.keys(imprStats).map(key => {
			results.push({
				website: key,
				impressions: imprStats[key] || 0,
				earnings: earnStats[key] || 0,
				clicks: clickStats[key] || 0,
			})
		})
		return results
	}

	CampaignActions = ({ campaign, actions, t }) => {
		return (
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Button
						color='secondary'
						onClick={() => {
							actions.closeCampaign({ campaign })
						}}
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
			// classes,
			item,
			// handleChange,
			// activeFields,
			// isDemo,
			actions,
			history,
			mainTokenSymbol,
			campaingAnalytics,
			// ...rest
		} = this.props
		const { tabIndex } = this.state
		const data = this.getTableData(campaingAnalytics, item.id)
		// const pieData = this.getPieChartData(campaingAnalytics, item.id, 6)
		const columns = [
			{
				name: 'website',
				label: t('WEBSITE'),
				options: {
					filter: true,
					sort: true,
				},
			},
			{
				name: 'impressions',
				label: t('CHART_LABEL_IMPRESSIONS'),
				options: {
					filter: true,
					sort: true,
					customFilterListOptions: {
						render: v => `${t('CHART_LABEL_IMPRESSIONS')}: >=${v}`,
					},
					filterOptions: {
						names: ['100', '200', '500', '1000'],
						logic: (impressions, filters) => {
							if (filters.length) return Number(impressions) <= Number(filters)
							return false
						},
					},
					filterType: 'dropdown',
				},
			},
			{
				name: 'earnings',
				label: t('WEBSITE_EARNINGS'),
				options: {
					filter: false,
					sort: true,
				},
			},
			{
				name: 'clicks',
				label: t('CHART_LABEL_CLICKS'),
				options: {
					filter: false,
					sort: true,
				},
			},
		]
		const units = item.spec.adUnits
		const campaign = new CampaignModel(item)

		const balances =
			campaign.status && campaign.status.lastApprovedBalances
				? campaign.status.lastApprovedBalances
				: {}

		const status = (campaign.status || {}).name
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
					<AppBar position='static' color='default'>
						<Tabs
							value={tabIndex}
							onChange={this.handleTabChange}
							scrollable
							scrollButtons='off'
							indicatorColor='primary'
							textColor='primary'
						>
							<Tab label={t('STATE')} />
							<Tab label={t('CAMPAIGN_UNITS')} />
							<Tab label={t('VALIDATORS')} />
						</Tabs>
					</AppBar>
					<div style={{ marginTop: 10 }}>
						{tabIndex === 0 && (
							<Grid container spacing={2}>
								<Box clone order={{ xs: 2, md: 2, lg: 1 }}>
									<Grid item lg={8} md={12} xs={12}>
										<MUIDataTableEnchanced
											title={t('CAMPAIGN_STATS_BREAKDOWN')}
											data={data}
											columns={columns}
											options={{
												filterType: 'multiselect',
												selectableRows: 'none',
											}}
										/>
									</Grid>
								</Box>
								<Box clone order={{ xs: 1, md: 1, lg: 2 }}>
									<Grid item lg={4} md={12} xs={12}>
										<CampaignStatsDoughnut
											campaingAnalytics={campaingAnalytics}
											campaignId={item.id}
										/>
									</Grid>
								</Box>
							</Grid>
						)}
						{tabIndex === 1 && (
							<EnhancedTable itemType={'AdUnit'} items={units} noActions />
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
		rowsView: !!persist.ui[VIEW_MODE],
		objModel: CampaignModel,
		itemType: 'Campaign',
		mainTokenSymbol: selectMainToken(state).symbol,
		campaingAnalytics: persist.analytics.campaigns,
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
