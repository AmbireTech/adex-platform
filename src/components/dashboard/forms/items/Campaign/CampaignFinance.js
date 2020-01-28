import React, { Component } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import NewCampaignHoc from './NewCampaignHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import FormGroup from '@material-ui/core/FormGroup'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import Input from '@material-ui/core/Input'
import InputLabel from '@material-ui/core/InputLabel'
import Checkbox from '@material-ui/core/Checkbox'
import TextField from '@material-ui/core/TextField'
import DateTimePicker from 'components/common/DateTimePicker'
import { FullContentSpinner } from 'components/common/dialog/content'
import { utils } from 'ethers'
import { openChannel } from 'services/smart-contracts/actions/core'
import { validations, Joi } from 'adex-models'
import MomentUtils from '@date-io/moment'
import { selectSpinnerById, selectMainToken } from 'selectors'
import { GETTING_CAMPAIGNS_FEES } from 'constants/spinners'

const moment = new MomentUtils()

const getTotalImpressions = ({ depositAmount, minPerImpression, t }) => {
	const dep = parseFloat(depositAmount)
	const min = parseFloat(minPerImpression)
	if (!dep) {
		return t('DEPOSIT_NOT_SET')
	} else if (!min) {
		return t('CPM_NOT_SET')
	} else {
		const impressions = utils.commify(Math.floor((dep / min) * 1000))
		return t('TOTAL_IMPRESSIONS', { args: [impressions] })
	}
}

class CampaignFinance extends Component {
	constructor(props) {
		super(props)

		this.state = {
			maxChannelFees: 1,
			loading: true,
		}
	}

	async componentDidMount() {
		const { newItem, actions, account } = this.props
		const { updateSpinner } = actions

		updateSpinner(GETTING_CAMPAIGNS_FEES, true)

		// const campaign = { ...newItem }
		// const feesData = await openChannel({
		// 	campaign,
		// 	account,
		// 	getFeesOnly: true,
		// 	getMaxFees: true,
		// })

		// this.setState({ maxChannelFees: feesData.fees, loading: false })
		updateSpinner(GETTING_CAMPAIGNS_FEES, false)
	}

	render() {
		const {
			handleChange,
			newItem,
			t,
			invalidFields,
			account,
			spinner,
			mainTokenSymbol,
		} = this.props
		const {
			title,
			validators,
			depositAmount,
			minPerImpression,
			// depositAsset,
			activeFrom,
			withdrawPeriodStart,
			minTargetingScore,
		} = newItem

		const { maxChannelFees, loading } = this.state

		const { availableIdentityBalanceMainToken = 0 } =
			account.stats.formatted || {}

		const from = activeFrom || undefined
		const to = withdrawPeriodStart || undefined
		const now = moment.date().valueOf()

		const errTitle = invalidFields['title']
		const errDepAmnt = invalidFields['depositAmount']
		const errMin = invalidFields['minPerImpression']
		const errFrom = invalidFields['activeFrom']
		const errTo = invalidFields['withdrawPeriodStart']

		const impressions = !(errDepAmnt || errMin)
			? getTotalImpressions({ depositAmount, minPerImpression, t })
			: ''

		const leader = validators[0] || {}
		const follower = validators[1] || {}

		return (
			<div>
				{spinner || loading ? (
					<FullContentSpinner />
				) : (
					<Grid container spacing={2}>
						<Grid item sm={12} md={12}>
							<TextField
								fullWidth
								type='text'
								required
								label={t('title', { isProp: true })}
								name='title'
								value={title}
								onChange={ev => {
									this.validateTitle(ev.target.value, 'title', true)
									handleChange('title', ev.target.value)
								}}
								error={errTitle && !!errTitle.dirty}
								maxLength={120}
								helperText={
									errTitle && !!errTitle.dirty
										? errTitle.errMsg
										: t('TITLE_HELPER_TXT') // TODO
								}
							/>
						</Grid>

						<Grid item sm={12} md={6}>
							<FormControl fullWidth disabled>
								<InputLabel htmlFor='leader-validator'>
									{t('ADV_PLATFORM_VALIDATOR')}
								</InputLabel>
								<Input id='leader-validator' value={leader.url || ''} />
								<FormHelperText>{leader.id}</FormHelperText>
							</FormControl>
						</Grid>

						<Grid item sm={12} md={6}>
							<FormControl fullWidth disabled>
								<InputLabel htmlFor='follower-validator'>
									{t('PUB_PLATFORM_VALIDATOR')}
								</InputLabel>
								<Input id='follower-validator' value={follower.url || ''} />
								<FormHelperText>{follower.id}</FormHelperText>
							</FormControl>
						</Grid>
						<Grid item sm={12} md={6}>
							<TextField
								fullWidth
								type='text'
								required
								label={t('DEPOSIT_AMOUNT_LABEL', {
									args: [
										parseFloat(
											availableIdentityBalanceMainToken - maxChannelFees
										).toFixed(2),

										mainTokenSymbol,
										maxChannelFees,
										mainTokenSymbol,
									],
								})}
								name='depositAmount'
								value={depositAmount}
								onChange={ev => {
									handleChange('depositAmount', ev.target.value)
								}}
								error={errDepAmnt && !!errDepAmnt.dirty}
								maxLength={120}
								helperText={
									errDepAmnt && !!errDepAmnt.dirty
										? errDepAmnt.errMsg
										: t('DEPOSIT_AMOUNT_HELPER_TXT', {
												args: [maxChannelFees, mainTokenSymbol],
										  })
								}
							/>
						</Grid>
						<Grid item sm={12} md={6}>
							<TextField
								fullWidth
								type='text'
								required
								label={t('CPM_LABEL', { args: [impressions] })}
								name='minPerImpression'
								value={minPerImpression}
								onChange={ev => {
									handleChange('minPerImpression', ev.target.value)
								}}
								error={errMin && !!errMin.dirty}
								maxLength={120}
								helperText={
									errMin && !!errMin.dirty ? errMin.errMsg : t('CPM_HELPER_TXT')
								}
							/>
						</Grid>
						<Grid item sm={12} md={6}>
							<DateTimePicker
								emptyLabel={t('SET_CAMPAIGN_START')}
								disablePast
								fullWidth
								calendarIcon
								label={t('CAMPAIGN_STARTS')}
								minDate={now}
								maxDate={to}
								onChange={val => {
									handleChange('activeFrom', val.valueOf(), true)
								}}
								value={from || null}
								error={errFrom && !!errFrom.dirty}
								helperText={
									errFrom && !!errFrom.dirty
										? errFrom.errMsg
										: t('CAMPAIGN_STARTS_FROM_HELPER_TXT')
								}
							/>
						</Grid>
						<Grid item sm={12} md={6}>
							<DateTimePicker
								emptyLabel={t('SET_CAMPAIGN_END')}
								disablePast
								fullWidth
								calendarIcon
								label={t('CAMPAIGN_ENDS')}
								minDate={from || now}
								onChange={val =>
									handleChange('withdrawPeriodStart', val.valueOf(), true)
								}
								value={to || null}
								error={errTo && !!errTo.dirty}
								helperText={
									errTo && !!errTo.dirty
										? errTo.errMsg
										: t('CAMPAIGN_ENDS_HELPER_TXT')
								}
							/>
						</Grid>
						<Grid item sm={12} md={6}>
							<FormGroup row>
								<FormControlLabel
									control={
										<Checkbox
											checked={!!minTargetingScore}
											onChange={ev =>
												handleChange(
													'minTargetingScore',
													ev.target.checked ? 1 : null
												)
											}
											value='minTargetingScore'
										/>
									}
									label={t('CAMPAIGN_MIN_TARGETING')}
								/>
							</FormGroup>
						</Grid>
					</Grid>
				)}
			</div>
		)
	}
}

CampaignFinance.propTypes = {
	newItem: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
	const { persist } = state
	const spinner = selectSpinnerById(state, GETTING_CAMPAIGNS_FEES)
	return {
		account: persist.account,
		spinner,
		mainTokenSymbol: selectMainToken(state).symbol,
	}
}

const NewCampaignFinance = NewCampaignHoc(CampaignFinance)

export default connect(mapStateToProps)(Translate(NewCampaignFinance))
