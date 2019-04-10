import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewCampaignHoc from './NewCampaignHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import Dropdown from 'components/common/dropdown'
import TextField from '@material-ui/core/TextField'
import DatePicker from 'components/common/DatePicker'
import { utils } from 'ethers'
import { validations } from 'adex-models'
import DateFnsUtils from "@date-io/moment";

const moment = new DateFnsUtils()

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
		fee: VALIDATOR_LEADER_FEE
	}
}

const PubPlatformValidators = {
	[VALIDATOR_FOLLOWER_ID]: {
		id: VALIDATOR_FOLLOWER_ID,
		url: VALIDATOR_FOLLOWER_URL,
		fee: VALIDATOR_FOLLOWER_FEE
	}
}

const VALIDATOR_SOURCES = [
	AdvPlatformValidators,
	PubPlatformValidators
]

const AdvValidatorsSrc = Object.keys(AdvPlatformValidators).map(key => {
	const val = AdvPlatformValidators[key]
	return {
		value: key,
		label: `${val.url} - ${val.id}`
	}
})

const PubValidatorsSrc = Object.keys(PubPlatformValidators).map(key => {
	const val = PubPlatformValidators[key]
	return {
		value: key,
		label: `${val.url} - ${val.id}`
	}
})



const validateCampaignDates = ({ created = Date.now(), withdrawPeriodStart, validUntil }) => {
	let error = null

	if (withdrawPeriodStart && validUntil && (withdrawPeriodStart >= validUntil)) {
		error = { message: 'ERR_VALID_UNTIL_BEFORE_START', prop: 'validUntil' }
	} else if (withdrawPeriodStart && (withdrawPeriodStart < created)) {
		error = { message: 'ERR_WITHDRAW_PERIOD_IN_PAST', prop: 'withdrawPeriodStart' }
	} else if (validUntil && (validUntil < created)) {
		error = { message: 'ERR_VALID_UNTIL_IN_PAST', prop: 'validUntil' }
	}

	return { error }
}

const validateAmounts = ({ depositAmount, maxPerImpression, minPerImpression }) => {
	const dep = parseFloat(depositAmount)
	const max = parseFloat(maxPerImpression)
	const min = parseFloat(minPerImpression)

	let error = null
	if (min && max && (min > max)) {
		error = { message: 'ERR_MIN_OVER_MAX', prop: 'maxPerImpression' }
	} else if (dep && (dep < max)) {
		error = { message: 'ERR_MAX_IMPR_OVER_DEPOSIT', prop: 'maxPerImpression' }
	} if (dep && (dep < min)) {
		error = { message: 'ERR_MIN_IMPR_OVER_DEPOSIT', prop: 'maxPerImpression' }
	}

	return { error }
}

class CampaignFinance extends Component {
	componentDidMount() {
		const { newItem, handleChange } = this.props
		this.validateAndUpdateValidator(false, 0, newItem.validators[0])
		this.validateAndUpdateValidator(false, 0, newItem.validators[1])
		this.validateAmount(newItem.depositAmount, 'depositAmount', false, 'REQUIRED_FIELD')
		this.validateAmount(newItem.maxPerImpression, 'maxPerImpression', false, 'REQUIRED_FIELD')
		this.validateAmount(newItem.minPerImpression, 'minPerImpression', false, 'REQUIRED_FIELD')

		const { withdrawPeriodStart, validUntil, created } = newItem
		if (!withdrawPeriodStart) {
			handleChange('handleChange', Date.now())
		}
		if (!validUntil) {
			handleChange('validUntil', Date.now())
		}
		if (!created) {
			handleChange('created', Date.now())
		}
	}

	validateUnits(adUnits, dirty) {
		const isValid = !!adUnits.length
		this.props.validate(
			'adUnits',
			{
				isValid: isValid,
				err: { msg: 'ERR_ADUNITS_REQIURED' },
				dirty: dirty
			})
	}

	validateAndUpdateValidator = (dirty, index, key) => {
		const { validators } = this.props.newItem
		const newValidators = [...validators]
		const newValue = VALIDATOR_SOURCES[index][key]

		newValidators[index] = newValue

		const isValid =
			!!newValidators[0] &&
			!!newValidators[1] &&
			!!newValidators[0].id &&
			!!newValidators[0].url &&
			!!newValidators[1].id &&
			!!newValidators[1].url

		this.props.handleChange('validators', newValidators)
		this.props.validate('validators', {
			isValid: isValid,
			err: { msg: 'ERR_VALIDATORS' },
			dirty: dirty
		})
	}

	validateAmount(value = '', prop, dirty, errMsg) {
		const isValidNumber = validations.isNumberString(value)
		const isValid = isValidNumber && utils.parseUnits(value, 18)

		if (!isValid) {
			this.props.validate(
				prop,
				{
					isValid: isValid,
					err: { msg: errMsg || 'ERR_INVALID_AMOUNT' },
					dirty: dirty
				})
		} else {

			const { newItem } = this.props

			const depositAmount = (prop === 'depositAmount') ? value : newItem.depositAmount
			const maxPerImpression = (prop === 'maxPerImpression') ? value : newItem.maxPerImpression
			const minPerImpression = (prop === 'minPerImpression') ? value : newItem.minPerImpression

			const result = validateAmounts({ depositAmount, maxPerImpression, minPerImpression })

			this.props.validate(
				prop,
				{
					isValid: !result.error,
					err: { msg: result.error ? result.error.message : '' },
					dirty: dirty
				})
		}
	}

	handleDates = (prop, value, dirty) => {

		const { newItem, handleChange } = this.props
		const withdrawPeriodStart = (prop === 'withdrawPeriodStart') ? value : newItem.withdrawPeriodStart
		const validUntil = (prop === 'validUntil') ? value : newItem.validUntil
		const result = validateCampaignDates({ withdrawPeriodStart, validUntil, created: newItem.created })

		this.props.validate(
			'withdrawPeriodStart',
			{
				isValid: !result.error,
				err: { msg: result.error ? result.error.message : '' },
				dirty: dirty
			})

		this.props.validate(
			'validUntil',
			{
				isValid: !result.error,
				err: { msg: result.error ? result.error.message : '' },
				dirty: dirty
			})

		handleChange(prop, value)
	}

	render() {
		const {
			handleChange,
			newItem,
			t,
			invalidFields
		} = this.props
		const {
			validators,
			depositAmount,
			minPerImpression,
			maxPerImpression,
			depositAsset,
			validUntil,
			withdrawPeriodStart
		} = newItem

		const from = withdrawPeriodStart || undefined
		const to = validUntil || undefined
		const now = moment.date().valueOf()

		const errDepAmnt = invalidFields['depositAmount']
		const errMin = invalidFields['minPerImpression']
		const errMax = invalidFields['maxPerImpression']
		const errFrom = invalidFields['withdrawPeriodStart']
		const errTo = invalidFields['validUntil']

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item xs={12}>
						<Dropdown
							fullWidth
							required
							onChange={(value) =>
								this.validateAndUpdateValidator(true, 0, value)}
							source={AdvValidatorsSrc}
							value={(validators[0] || {}).id + ''}
							label={t('ADV_PLATFORM_VALIDATOR')}
							htmlId='leader-validator-dd'
							name='leader-validator'
						/>
					</Grid>
					<Grid item xs={12}>
						<Dropdown
							fullWidth
							required
							onChange={(value) =>
								this.validateAndUpdateValidator(true, 1, value)}
							source={PubValidatorsSrc}
							value={(validators[1] || {}).id + ''}
							label={t('PUB_PLATFORM_VALIDATOR')}
							htmlId='follower-validator-dd'
							name='follower-validator'
						/>
					</Grid>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={'Campaign ' + t('depositAmount', { isProp: true, args: ['DAI'] })}
							name='depositAmount'
							value={depositAmount}
							onChange={(ev) =>
								handleChange('depositAmount', ev.target.value)}
							onBlur={() =>
								this.validateAmount(depositAmount, 'depositAmount', true)}
							onFocus={() =>
								this.validateAmount(depositAmount, 'depositAmount', false)}
							error={errDepAmnt && !!errDepAmnt.dirty}
							maxLength={120}
							helperText={
								(errDepAmnt && !!errDepAmnt.dirty)
									? errDepAmnt.errMsg
									: t('DEPOSIT_AMOUNT_HELPER_TXT')
							}
						/>
					</Grid>
					<Grid item sm={12} md={6}>
						<TextField
							fullWidth
							type='text'
							required
							label={'Campaign ' + t('minPerImpression', { isProp: true, args: ['DAI'] })}
							name='minPerImpression'
							value={minPerImpression}
							onChange={(ev) =>
								handleChange('minPerImpression', ev.target.value)}
							onBlur={() =>
								this.validateAmount(minPerImpression, 'minPerImpression', true)}
							onFocus={() =>
								this.validateAmount(minPerImpression, 'minPerImpression', false)}
							error={errMin && !!errMin.dirty}
							maxLength={120}
							helperText={
								(errMin && !!errMin.dirty)
									? errMin.errMsg
									: t('MIN_PER_IMPRESSION_HELPER_TXT')
							}
						/>
					</Grid>
					<Grid item sm={12} md={6}>
						<TextField
							fullWidth
							type='text'
							required
							label={'Campaign ' + t('maxPerImpression', { isProp: true, args: ['DAI'] })}
							name='maxPerImpression'
							value={maxPerImpression}
							onChange={(ev) =>
								handleChange('maxPerImpression', ev.target.value)}
							onBlur={() =>
								this.validateAmount(maxPerImpression, 'maxPerImpression', true)}
							onFocus={() =>
								this.validateAmount(maxPerImpression, 'maxPerImpression', false)}
							error={errMax && !!errMax.dirty}
							maxLength={120}
							helperText={
								(errMax && !!errMax.dirty)
									? errMax.errMsg
									: t('MAX_PER_IMPRESSION_HELPER_TXT')
							}
						/>
					</Grid>
					<Grid item sm={12} md={6}>
						<DatePicker
							fullWidth
							calendarIcon
							label={t('withdrawPeriodStart', { isProp: true })}
							minDate={now}
							maxDate={to}
							onChange={(val) => {
								console.log('vall', val.valueOf())
								this.handleDates('withdrawPeriodStart', val.valueOf(), true)
							}}
							value={from}
							error={errFrom && !!errFrom.dirty}
							helperText={
								(errFrom && !!errFrom.dirty)
									? errFrom.errMsg
									: t('WITHDRAW_START_PERIOD_HELPER_TXT')
							}
						/>
					</Grid>
					<Grid item sm={12} md={6}>
						<DatePicker
							fullWidth
							calendarIcon
							label={t('validUntil', { isProp: true })}
							minDate={from || now}
							onChange={(val) =>
								this.handleDates('validUntil', val.valueOf(), true)}
							value={to}
							error={errTo && !!errTo.dirty}
							helperText={
								(errTo && !!errTo.dirty)
									? errTo.errMsg
									: t('VALID_UNTIL_HELPER_TXT')
							}
						/>
					</Grid>
				</Grid>
			</div>
		)
	}
}

CampaignFinance.propTypes = {
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string,
	descriptionHelperTxt: PropTypes.string,
	nameHelperTxt: PropTypes.string,
	adUnits: PropTypes.array.isRequired
}

const NewCampaignFinance = NewCampaignHoc(CampaignFinance)

export default Translate(NewCampaignFinance)
