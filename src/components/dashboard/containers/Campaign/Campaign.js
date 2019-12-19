import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions, { execute } from 'actions'
import { push } from 'connected-react-router'
import Grid from '@material-ui/core/Grid'
import ItemHoc from 'components/dashboard/containers/ItemHoc'
import EnhancedTable from 'components/dashboard/containers/Tables/EnhancedTable'
import Translate from 'components/translate/Translate'
import Button from '@material-ui/core/Button'
import { AdUnit as AdUnitModel, Campaign as CampaignModel } from 'adex-models'
import { SORT_PROPERTIES_ITEMS, FILTER_PROPERTIES_ITEMS } from 'constants/misc'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { CampaignProps } from 'components/dashboard/containers/ItemCommon'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import AppBar from '@material-ui/core/AppBar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ListSubheader from '@material-ui/core/ListSubheader'
import Anchor from 'components/common/anchor/anchor'
import { formatTokenAmount } from 'helpers/formatters'
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

	// componentDidMount = () => {
	// 	this.props.actions.updateCampaignState({ campaign: this.props.item })
	// 	// this.props.actions.updateCampaignStatistics({ campaign: this.props.item })
	// }

	handleTabChange = (event, index) => {
		this.setState({ tabIndex: index })
	}

	CampaignActions = ({ campaign, actions, t }) => {
		return (
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Button
						color='secondary'
						onClick={() => {
							actions.closeCampaign({ campaign })
							// execute(push('/dashboard/advertiser/campaigns'))
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
			// setActiveFields,
			// handleChange,
			// activeFields,
			// isDemo,
			actions,
			history,
			// ...rest
		} = this.props
		const { tabIndex } = this.state

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
							<List
								subheader={
									<ListSubheader component='div'>{t('BALANCES')}</ListSubheader>
								}
							>
								{Object.keys(balances).map(key => (
									<ListItem key={key}>
										<ListItemText
											primary={formatTokenAmount(balances[key]) + ' SAI'}
											secondary={key}
										/>
									</ListItem>
								))}
							</List>
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

function mapStateToProps(state) {
	const { persist } = state
	// let memory = state.memory
	return {
		units: persist.items['AdUnit'],
		rowsView: !!persist.ui[VIEW_MODE],
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
