import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import {
	Grid,
	FormGroup,
	FormControlLabel,
	FormControl,
	FormHelperText,
	Input,
	InputLabel,
	Checkbox,
	TextField,
} from '@material-ui/core'
import { Alert } from '@material-ui/lab'
import DateTimePicker from 'components/common/DateTimePicker'
import { FullContentSpinner } from 'components/common/dialog/content'
import { utils } from 'ethers'
import MomentUtils from '@date-io/moment'
import {
	selectSpinnerById,
	selectMainToken,
	selectNewCampaign,
	selectValidationsById,
	t,
} from 'selectors'
import { execute, updateNewCampaign, validateNumberString } from 'actions'
import { GETTING_CAMPAIGNS_FEES } from 'constants/spinners'
import { validations } from 'adex-models'
const { isNumberString } = validations

const moment = new MomentUtils()

const getTotalImpressions = ({ depositAmount, minPerImpression }) => {
	try {
		const dep = isNumberString(depositAmount) && parseFloat(depositAmount)
		const min = isNumberString(minPerImpression) && parseFloat(minPerImpression)
		if (!dep) {
			return t('DEPOSIT_NOT_SET')
		} else if (!min) {
			return t('CPM_NOT_SET')
		} else {
			const impressions = utils.commify(Math.floor((dep / min) * 1000))
			return t('TOTAL_IMPRESSIONS', { args: [impressions] })
		}
	} catch (err) {
		return 'N/A'
	}
}

function CampaignFinance({ validateId }) {
	const invalidFields = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	const { symbol } = useSelector(selectMainToken)
	const campaign = useSelector(selectNewCampaign)

	const {
		title,
		validators,
		depositAmount,
		minPerImpression,
		// depositAsset,
		activeFrom,
		withdrawPeriodStart,
		minTargetingScore,
		temp = {},
	} = campaign

	const { maxChannelFees, maxDepositFormatted } = temp

	const spinner = useSelector(state =>
		selectSpinnerById(state, GETTING_CAMPAIGNS_FEES)
	)

	const from = activeFrom || undefined
	const to = withdrawPeriodStart || undefined
	const now = moment.date().valueOf()

	const {
		title: errTitle,
		depositAmount: errDepAmnt,
		minPerImpression: errMin,
		activeFrom: errFrom,
		withdrawPeriodStart: errTo,
		minTargetingScore: errUnitsTargeting,
	} = invalidFields

	const impressions = getTotalImpressions({
		depositAmount,
		minPerImpression,
	})

	const leader = validators[0] || {}
	const follower = validators[1] || {}

	return (
		<div>
			{spinner ? (
				<FullContentSpinner />
			) : (
				<Grid container spacing={2}>
					<Grid item xs={12} sm={12} md={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('title', { isProp: true })}
							name='title'
							value={title}
							onChange={ev => {
								execute(updateNewCampaign('title', ev.target.value))
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

					<Grid item xs={12} sm={12} md={6}>
						<FormControl fullWidth disabled>
							<InputLabel htmlFor='leader-validator'>
								{t('ADV_PLATFORM_VALIDATOR')}
							</InputLabel>
							<Input id='leader-validator' value={leader.url || ''} />
							<FormHelperText>{leader.id}</FormHelperText>
						</FormControl>
					</Grid>

					<Grid item xs={12} sm={12} md={6}>
						<FormControl fullWidth disabled>
							<InputLabel htmlFor='follower-validator'>
								{t('PUB_PLATFORM_VALIDATOR')}
							</InputLabel>
							<Input id='follower-validator' value={follower.url || ''} />
							<FormHelperText>{follower.id}</FormHelperText>
						</FormControl>
					</Grid>
					<Grid item xs={12} sm={12} md={6}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('DEPOSIT_AMOUNT_LABEL', {
								args: [maxDepositFormatted, symbol, maxChannelFees, symbol],
							})}
							name='depositAmount'
							value={depositAmount}
							onChange={ev => {
								const value = ev.target.value
								execute(updateNewCampaign('depositAmount', value))
								execute(
									validateNumberString({
										validateId,
										prop: 'depositAmount',
										value,
										dirty: true,
									})
								)
							}}
							error={errDepAmnt && !!errDepAmnt.dirty}
							maxLength={120}
							helperText={
								errDepAmnt && !!errDepAmnt.dirty ? errDepAmnt.errMsg : ''
							}
						/>
					</Grid>
					<Grid item xs={12} sm={12} md={6}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('CPM_LABEL', { args: [impressions] })}
							name='minPerImpression'
							value={minPerImpression}
							onChange={ev => {
								const value = ev.target.value
								execute(updateNewCampaign('minPerImpression', value))
								execute(
									validateNumberString({
										validateId,
										prop: 'minPerImpression',
										value,
										dirty: true,
									})
								)
							}}
							error={errMin && !!errMin.dirty}
							maxLength={120}
							helperText={
								errMin && !!errMin.dirty ? errMin.errMsg : t('CPM_HELPER_TXT')
							}
						/>
					</Grid>
					<Grid item xs={12} sm={12} md={6}>
						<DateTimePicker
							emptyLabel={t('SET_CAMPAIGN_START')}
							disablePast
							fullWidth
							calendarIcon
							label={t('CAMPAIGN_STARTS')}
							minDate={now}
							maxDate={to}
							onChange={val => {
								execute(updateNewCampaign('activeFrom', val.valueOf()))
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
					<Grid item xs={12} sm={12} md={6}>
						<DateTimePicker
							emptyLabel={t('SET_CAMPAIGN_END')}
							disablePast
							fullWidth
							calendarIcon
							label={t('CAMPAIGN_ENDS')}
							minDate={from || now}
							onChange={val =>
								execute(updateNewCampaign('withdrawPeriodStart', val.valueOf()))
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
					<Grid item xs={12} sm={12} md={6}>
						<FormControl error={errUnitsTargeting && errUnitsTargeting.dirty}>
							<FormGroup row>
								<FormControlLabel
									control={
										<Checkbox
											checked={!!minTargetingScore}
											onChange={ev =>
												execute(
													updateNewCampaign(
														'minTargetingScore',
														ev.target.checked ? 1 : null
													)
												)
											}
											value='minTargetingScore'
										/>
									}
									label={t('minTargetingScore', { isProp: true })}
								/>
							</FormGroup>
							<FormHelperText>
								{errUnitsTargeting && !!errUnitsTargeting.dirty ? (
									<Alert severity='error' variant='outlined'>
										{t('ERR_MIN_TARGETING_SCORE_ALERT')}
									</Alert>
								) : (
									''
								)}
							</FormHelperText>
						</FormControl>
					</Grid>
				</Grid>
			)}
		</div>
	)
}

CampaignFinance.propTypes = {
	validateId: PropTypes.string.isRequired,
}

export default CampaignFinance
