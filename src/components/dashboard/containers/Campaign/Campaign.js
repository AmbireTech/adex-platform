import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { updateCampaign } from 'services/adex-market/actions'
import Grid from '@material-ui/core/Grid'
import ItemHoc from 'components/dashboard/containers/ItemHoc'
import ItemsList from 'components/dashboard/containers/ItemsList'
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
import { Joi } from 'adex-models'

// import UnitTargets from 'components/dashboard/containers/UnitTargets'
const campaignTitleSchema = Joi.string()
	.min(3)
	.max(120)
	.allow('') // empty string not allowed by default
const VIEW_MODE = 'campaignRowsView'

export class Campaign extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {
			tabIndex: 0,
			statistics: {},
			dirtyProps: [],
		}
	}

	// componentDidMount = () => {
	// 	this.props.actions.updateCampaignState({ campaign: this.props.item })
	// 	// this.props.actions.updateCampaignStatistics({ campaign: this.props.item })
	// }

	editTitle = (campaign, id, authSig) => {
		updateCampaign({ campaign, id, authSig })
	}

	handleTabChange = (event, index) => {
		this.setState({ tabIndex: index })
	}

	CampaignActions = ({ campaign, actions, t }) => {
		return (
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<Button
						color='secondary'
						onClick={() => actions.closeCampaign({ campaign })}
					>
						{t('BTN_CLOSE_CAMPAIGN')}
					</Button>
				</Grid>
			</Grid>
		)
	}

	validateTitle(title, dirty) {
		const result = Joi.validate(title, campaignTitleSchema)
		this.props.validate('title', {
			isValid: !result.error,
			err: { msg: result.error ? result.error.message : '' },
			dirty: dirty,
		})
	}

	render() {
		const {
			t,
			// classes,
			item,
			setActiveFields,
			// handleChange,
			// activeFields,
			// isDemo,
			actions,
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
							/>
						)
					}
					validateTitle={this.validateTitle.bind(this)}
					handleChange={this.props.handleChange}
					editTitle={this.editTitle}
					account={this.props.account}
					dirtyProps={this.state.dirtyProps}
					setActiveFields={setActiveFields}
					campaignTitleSchema={campaignTitleSchema}
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
							<ItemsList
								removeFromItem
								items={units}
								viewModeId={VIEW_MODE}
								itemType='AdUnit'
								objModel={AdUnitModel}
								sortProperties={SORT_PROPERTIES_ITEMS}
								filterProperties={FILTER_PROPERTIES_ITEMS}
								uiStateId='campaign-units'
							/>
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
