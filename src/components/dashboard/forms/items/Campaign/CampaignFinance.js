import React, { Component } from 'react'
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
// import Dropdown from 'components/common/dropdown'
import TextField from '@material-ui/core/TextField'
import DateTimePicker from 'components/common/DateTimePicker'
import { utils } from 'ethers'
import { validations } from 'adex-models'
import MomentUtils from '@date-io/moment'
import { totalFeesFormatted } from 'services/smart-contracts/actions/core'
const moment = new MomentUtils()

const VALIDATOR_LEADER_URL = process.env.VALIDATOR_LEADER_URL
const VALIDATOR_LEADER_ID = process.env.VALIDATOR_LEADER_ID
const VALIDATOR_LEADER_FEE = '0'
const VALIDATOR_FOLLOWER_URL = process.env.VALIDATOR_FOLLOWER_URL
const VALIDATOR_FOLLOWER_ID = process.env.VALIDATOR_FOLLOWER_ID
const VALIDATOR_FOLLOWER_FEE = '0'

const AdvPlatformValidators = {
	[VALIDATOR_LEADER_ID]: {
		id: VALIDATOR_LEADER_ID,
		url: VALIDATOR_LEADER_URL,
		fee: VALIDATOR_LEADER_FEE,
	},
}

const PubPlatformValidators = {
	[VALIDATOR_FOLLOWER_ID]: {
		id: VALIDATOR_FOLLOWER_ID,
		url: VALIDATOR_FOLLOWER_URL,
		fee: VALIDATOR_FOLLOWER_FEE,
	},
}

const VALIDATOR_SOURCES = [AdvPlatformValidators, PubPlatformValidators]

// const AdvValidatorsSrc = Object.keys(AdvPlatformValidators).map(key => {
// 	const val = AdvPlatformValidators[key]
// 	return {
// 		value: key,
// 		label: `${val.url} - ${val.id}`,
// 	}
// })

// const PubValidatorsSrc = Object.keys(PubPlatformValidators).map(key => {
// 	const val = PubPlatformValidators[key]
// 	return {
// 		value: key,
// 		label: `${val.url} - ${val.id}`,
// 	}
// })

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

const validateCampaignDates = ({
	created = Date.now(),
	withdrawPeriodStart,
	activeFrom,
}) => {
	let error = null

	if (withdrawPeriodStart && activeFrom && withdrawPeriodStart <= activeFrom) {
		error = { message: 'ERR_END_BEFORE_START', prop: 'withdrawPeriodStart' }
	} else if (withdrawPeriodStart && withdrawPeriodStart < created) {
		error = { message: 'ERR_END_BEFORE_NOW', prop: 'withdrawPeriodStart' }
	} else if (activeFrom && activeFrom < created) {
		error = { message: 'ERR_START_BEFORE_NOW', prop: 'activeFrom' }
	} else if (activeFrom && !withdrawPeriodStart) {
		error = { message: 'ERR_NO_END', prop: 'withdrawPeriodStart' }
	} else if (!(withdrawPeriodStart || activeFrom)) {
		error = { message: 'ERR_NO_DATE_SET', prop: 'withdrawPeriodStart' }
	}

	return { error }
}

const validateAmounts = ({
	maxDeposit = 0,
	depositAmount,
	minPerImpression,
}) => {
	const maxDep = parseFloat(maxDeposit)
	const dep = parseFloat(depositAmount)
	const min = parseFloat(minPerImpression)

	let error = null
	if (dep && dep > maxDep) {
		error = {
			message: 'ERR_INSUFFICIENT_IDENTITY_BALANCE',
			prop: 'depositAmount',
		}
	}
	if (dep && dep < min) {
		error = { message: 'ERR_CPM_OVER_DEPOSIT', prop: 'minPerImpression' }
	}
	if (dep <= 0) {
		error = { message: 'ERR_ZERO_DEPOSIT', prop: 'depositAmount' }
	}
	if (min <= 0) {
		error = { message: 'ERR_ZERO_CPM', prop: 'minPerImpression' }
	}

	return { error }
}

class CampaignFinance extends Component {
	componentDidMount() {
		const { newItem } = this.props
		this.validateAndUpdateValidator(false, 0, newItem.validators[0])
		this.validateAndUpdateValidator(false, 1, newItem.validators[1])
		this.validateAmount(
			newItem.depositAmount,
			'depositAmount',
			false,
			'REQUIRED_FIELD'
		)
		this.validateAmount(
			newItem.minPerImpression,
			'minPerImpression',
			false,
			'REQUIRED_FIELD'
		)
		this.handleDates('activeFrom', newItem.activeFrom, false)
		this.handleDates('withdrawPeriodStart', newItem.withdrawPeriodStart, false)
	}

	validateAndUpdateValidator = (dirty, index, key = {}, update) => {
		const { handleChange, newItem, validate } = this.props
		const { validators } = newItem
		const newValidators = [...validators]
		const newValue = VALIDATOR_SOURCES[index][key.id || key]

		newValidators[index] = newValue

		const isValid =
			!!newValidators[0] &&
			!!newValidators[1] &&
			!!newValidators[0].id &&
			!!newValidators[0].url &&
			!!newValidators[1].id &&
			!!newValidators[1].url

		// TEMP - update like this to avoid changing the flow and other functions
		// <---
		if (!isValid) {
			const tempValidators = [
				{
					id: VALIDATOR_LEADER_ID,
					url: VALIDATOR_LEADER_URL,
					fee: VALIDATOR_LEADER_FEE,
				},
				{
					id: VALIDATOR_FOLLOWER_ID,
					url: VALIDATOR_FOLLOWER_URL,
					fee: VALIDATOR_FOLLOWER_FEE,
				},
			]

			handleChange('validators', tempValidators)

			validate('validators', {
				isValid: true,
				err: { msg: 'ERR_VALIDATORS' },
				dirty: dirty,
			})

			return
		}

		// END TEMP --->

		if (update) {
			handleChange('validators', newValidators)
		}

		validate('validators', {
			isValid: isValid,
			err: { msg: 'ERR_VALIDATORS' },
			dirty: dirty,
		})
	}

	validateAmount(value = '', prop, dirty, errMsg) {
		const isValidNumber = validations.isNumberString(value)
		const isValid = isValidNumber && utils.parseUnits(value, 18)

		if (!isValid) {
			this.props.validate(prop, {
				isValid: isValid,
				err: { msg: errMsg || 'ERR_INVALID_AMOUNT' },
				dirty: dirty,
			})
		} else {
			const { newItem, account } = this.props

			const { identityBalanceDai = 0, outstandingBalanceDai = 0 } =
				account.stats.formatted || {}

			const depositAmount =
				prop === 'depositAmount' ? value : newItem.depositAmount
			const minPerImpression =
				prop === 'minPerImpression' ? value : newItem.minPerImpression
			const maxDeposit =
				parseFloat(identityBalanceDai) +
				parseFloat(outstandingBalanceDai) -
				parseFloat(totalFeesFormatted)
			const result = validateAmounts({
				maxDeposit,
				depositAmount,
				minPerImpression,
			})

			this.props.validate(prop, {
				isValid: !result.error,
				err: { msg: result.error ? result.error.message : '' },
				dirty: dirty,
			})
		}
	}

	handleDates = (prop, value, dirty) => {
		const { newItem, handleChange, validate } = this.props
		const withdrawPeriodStart =
			prop === 'withdrawPeriodStart' ? value : newItem.withdrawPeriodStart
		const activeFrom = prop === 'activeFrom' ? value : newItem.activeFrom
		const result = validateCampaignDates({
			withdrawPeriodStart,
			activeFrom,
			created: newItem.created,
		})

		validate('activeFrom', {
			isValid: !(result.error && result.error.prop === 'activeFrom'),
			err: { msg: result.error ? result.error.message : '' },
			dirty: dirty,
		})

		validate('withdrawPeriodStart', {
			isValid: !(result.error && result.error.prop === 'withdrawPeriodStart'),
			err: { msg: result.error ? result.error.message : '' },
			dirty: dirty,
		})

		if (value) {
			handleChange(prop, value)
		}
	}

	render() {
		const { handleChange, newItem, t, invalidFields, account } = this.props
		const {
			validators,
			depositAmount,
			minPerImpression,
			// depositAsset,
			activeFrom,
			withdrawPeriodStart,
			minTargetingScore,
		} = newItem

		const { identityBalanceDai = 0, outstandingBalanceDai = 0 } =
			account.stats.formatted || {}

		const from = activeFrom || undefined
		const to = withdrawPeriodStart || undefined
		const now = moment.date().valueOf()

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
				<Grid container spacing={2}>
					{/* <Grid item xs={12}> */}
					<Grid item sm={12} md={6}>
						{/* <Dropdown
							fullWidth
							required
							onChange={value =>
								this.validateAndUpdateValidator(true, 0, value, true)
							}
							source={AdvValidatorsSrc}
							value={(validators[0] || {}).id + ''}
							label={t('ADV_PLATFORM_VALIDATOR')}
							htmlId='leader-validator-dd'
							name='leader-validator'
						/> */}
						<FormControl fullWidth disabled>
							<InputLabel htmlFor='leader-validator'>
								{t('ADV_PLATFORM_VALIDATOR')}
							</InputLabel>
							<Input id='leader-validator' value={leader.url || ''} />
							<FormHelperText>{leader.id}</FormHelperText>
						</FormControl>
					</Grid>
					{/* <Grid item xs={12}> */}
					<Grid item sm={12} md={6}>
						{/* <Dropdown
							fullWidth
							required
							onChange={value =>
								this.validateAndUpdateValidator(true, 1, value, true)
							}
							source={PubValidatorsSrc}
							value={(validators[1] || {}).id + ''}
							label={t('PUB_PLATFORM_VALIDATOR')}
							htmlId='follower-validator-dd'
							name='follower-validator'
						/> */}
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
									(
										parseFloat(identityBalanceDai) +
										parseFloat(outstandingBalanceDai) -
										parseFloat(totalFeesFormatted)
									).toFixed(2),
									'DAI',
									totalFeesFormatted,
									'DAI',
								],
							})}
							name='depositAmount'
							value={depositAmount}
							onChange={ev => {
								this.validateAmount(ev.target.value, 'depositAmount', true)
								handleChange('depositAmount', ev.target.value)
							}}
							error={errDepAmnt && !!errDepAmnt.dirty}
							maxLength={120}
							helperText={
								errDepAmnt && !!errDepAmnt.dirty
									? errDepAmnt.errMsg
									: t('DEPOSIT_AMOUNT_HELPER_TXT', {
											args: [totalFeesFormatted, 'DAI'],
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
								this.validateAmount(ev.target.value, 'minPerImpression', true)
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
								this.handleDates('activeFrom', val.valueOf(), true)
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
								this.handleDates('withdrawPeriodStart', val.valueOf(), true)
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
			</div>
		)
	}
}

CampaignFinance.propTypes = {
	newItem: PropTypes.object.isRequired,
}

const NewCampaignFinance = NewCampaignHoc(CampaignFinance)

export default Translate(NewCampaignFinance)
