import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import {
	Grid,
	FormGroup,
	FormControlLabel,
	FormControl,
	FormHelperText,
	Checkbox,
	TextField,
} from '@material-ui/core'
import DateTimePicker from 'components/common/DateTimePicker'
import { FullContentSpinner } from 'components/common/dialog/content'
import { utils } from 'ethers'
import MomentUtils from '@date-io/moment'
import { ItemSpecProp } from 'components/dashboard/containers/ItemCommon/'
import { ExternalAnchor } from 'components/common/anchor/anchor'
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

const getTotalImpressions = ({ depositAmount, min, max }) => {
	try {
		const dep = isNumberString(depositAmount) && parseFloat(depositAmount)
		const minBound = isNumberString(min) && parseFloat(min)
		const maxBound = isNumberString(max) && parseFloat(max)
		if (!dep) {
			return t('DEPOSIT_NOT_SET')
		} else if (!minBound || !maxBound) {
			return ''
			// return t('BOUNDS_NOT_NOT_SET')
		} else {
			const impressions = utils.commify(Math.floor((dep / minBound) * 1000))
			return t('TOTAL_IMPRESSIONS_UP_TO', { args: [impressions] })
		}
	} catch (err) {
		return ''
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
		pricingBounds = { IMPRESSION: {} },
		// depositAsset,
		activeFrom,
		withdrawPeriodStart,
		// minTargetingScore,
		temp = {},
	} = campaign

	const {
		maxChannelFees,
		maxDepositFormatted,
		useUtmTags,
		suggestedPricingBounds,
	} = temp

	const spinner = useSelector(state =>
		selectSpinnerById(state, GETTING_CAMPAIGNS_FEES)
	)

	const from = activeFrom || undefined
	const to = withdrawPeriodStart || undefined
	const now = moment.date().valueOf()

	const {
		title: errTitle,
		depositAmount: errDepAmnt,
		pricingBounds_min: errMin,
		pricingBounds_max: errMax,
		activeFrom: errFrom,
		withdrawPeriodStart: errTo,
	} = invalidFields

	const leader = validators[0] || {}
	const follower = validators[1] || {}

	const impressions = getTotalImpressions({
		depositAmount,
		min: pricingBounds.min,
		max: pricingBounds.max,
	})

	const updatePricingBoundsImpression = (type, value) => {
		const newPricingBounds = { ...pricingBounds }
		newPricingBounds.IMPRESSION[type] = value

		execute(updateNewCampaign('pricingBounds', newPricingBounds))
		execute(
			validateNumberString({
				validateId,
				prop: `pricingBounds_${type}`,
				value,
				dirty: true,
			})
		)
	}

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
							variant='outlined'
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
						<ItemSpecProp
							label={t('ADV_PLATFORM_VALIDATOR')}
							prop='leader-validator'
							value={leader.url || ''}
							helperText={leader.id}
							disabled
						/>
					</Grid>

					<Grid item xs={12} sm={12} md={6}>
						<ItemSpecProp
							label={t('PUB_PLATFORM_VALIDATOR')}
							prop='follower-validator'
							value={follower.url || ''}
							helperText={follower.id}
							disabled
						/>
					</Grid>

					<Grid item xs={12} sm={12} md={12}>
						<TextField
							fullWidth
							variant='outlined'
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
								errDepAmnt && !!errDepAmnt.dirty
									? errDepAmnt.errMsg
									: impressions
							}
						/>
					</Grid>
					<Grid item xs={12} sm={12} md={6}>
						<TextField
							fullWidth
							variant='outlined'
							type='text'
							required
							label={t('CPM_MIN_LABEL')}
							name='pricingBounds_min'
							value={pricingBounds.IMPRESSION.min}
							onChange={ev => {
								const value = ev.target.value
								updatePricingBoundsImpression('min', value)
							}}
							error={errMin && !!errMin.dirty}
							maxLength={120}
							helperText={
								errMin && !!errMin.dirty
									? errMin.errMsg
									: t('CPM_MIN_HELPER_TXT', {
											args: [suggestedPricingBounds.IMPRESSION.min, symbol],
									  })
							}
						/>
					</Grid>
					<Grid item xs={12} sm={12} md={6}>
						<TextField
							fullWidth
							variant='outlined'
							type='text'
							required
							label={t('CPM_MAX_LABEL')}
							name='pricingBounds_max'
							value={pricingBounds.IMPRESSION.max}
							onChange={ev => {
								const value = ev.target.value
								updatePricingBoundsImpression('max', value)
							}}
							error={errMax && !!errMax.dirty}
							maxLength={120}
							helperText={
								errMax && !!errMax.dirty
									? errMax.errMsg
									: t('CPM_MAX_HELPER_TXT', {
											args: [suggestedPricingBounds.IMPRESSION.max, symbol],
									  })
							}
						/>
					</Grid>
					<Grid item xs={12} sm={12} md={6}>
						<DateTimePicker
							emptyLabel={t('SET_CAMPAIGN_START')}
							inputVariant='outlined'
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
							inputVariant='outlined'
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
						<FormControl>
							<FormGroup row>
								<FormControlLabel
									control={
										<Checkbox
											checked={!!useUtmTags}
											onChange={ev =>
												execute(
													updateNewCampaign('temp', {
														...temp,
														useUtmTags: ev.target.checked,
													})
												)
											}
											value='useUtmTags'
										/>
									}
									label={t('CAMPAIGN_AUTO_UTM_TAGS')}
								/>
							</FormGroup>
							<FormHelperText>
								{t('CAMPAIGN_AUTO_UTM_TAGS_INFO', {
									args: [
										<ExternalAnchor
											href={
												' https://help.adex.network/hc/en-us/articles/360011670859-How-to-add-UTM-links-and-track-campaigns'
											}
										>
											{t('CHECK_HERE')}
										</ExternalAnchor>,
									],
								})}
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
