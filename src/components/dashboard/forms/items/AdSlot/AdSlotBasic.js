import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewAdSlotHoc from './NewAdSlotHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Dropdown from 'components/common/dropdown'
import { utils } from 'ethers'
import { validations, constants, schemas, Joi } from 'adex-models'
import { getUnitsStatsByType } from 'services/adex-market/aggregates'

const { adSlotPost } = schemas

const AdTypes = constants.AdUnitsTypes.map(type => {
	return {
		value: type,
		label: type.split('_')[1],
	}
})

class AdSlotBasic extends Component {
	constructor(props) {
		super(props)
		this.state = {
			adTypes: AdTypes,
		}
	}

	async componentDidMount() {
		const { newItem } = this.props
		this.validateTitle(newItem.title, false)
		this.validateDescription(newItem.description, false)
		this.validateAndUpdateType(false, newItem.type)

		const unitsStats = await getUnitsStatsByType()

		// TEMP: will do it with action and keep in the store
		const adTypes = AdTypes.map(adType => {
			const { totalVolume, avgCPM } =
				(unitsStats[adType.value] || {}).formatted || {}
			return {
				value: adType.value,
				label: `${adType.label}, avg CPM: ${avgCPM ||
					' N/A'} DAI, total volume: ${totalVolume || ' N/A'} DAI `,
				sort: parseFloat(avgCPM || 0),
			}
		})

		adTypes.sort((a, b) => b.sort - a.sort)

		this.setState({ adTypes })
	}

	validateTitle(name, dirty, errMsg) {
		const result = Joi.validate(name, adSlotPost.title)

		this.props.validate('title', {
			isValid: !result.error,
			err: { msg: result.error ? result.error.message : '' },
			dirty: dirty,
		})
	}

	validateDescription(name, dirty, errMsg) {
		const result = Joi.validate(name, adSlotPost.description)

		this.props.validate('description', {
			isValid: !result.error,
			err: { msg: result.error ? result.error.message : '' },
			dirty: dirty,
		})
	}

	validateAndUpdateType = (dirty, value) => {
		const result = Joi.validate(value, adSlotPost.type)

		this.props.handleChange('type', value)
		this.props.validate('type', {
			isValid: !result.error,
			err: { msg: result.error ? result.error.message : '' },
			dirty: dirty,
		})
	}

	validateAmount(value = '', prop, dirty, errMsg) {
		const isValidNumber = validations.isNumberString(value)
		const isValid = isValidNumber && utils.parseUnits(value, 18)

		this.props.validate(prop, {
			isValid: isValid,
			err: { msg: errMsg || 'ERR_INVALID_AMOUNT' },
			dirty: dirty,
		})
	}

	updateMinPerImpression(value = '') {
		const { temp } = this.props.newItem
		const newTemp = { ...temp }
		newTemp.minPerImpression = value

		this.props.handleChange('temp', newTemp)
	}

	render() {
		const {
			t,
			newItem,
			invalidFields,
			handleChange,
			// nameHelperTxt,
			// descriptionHelperTxt
		} = this.props
		const { adTypes } = this.state
		const { type, title, description, temp } = newItem
		const { minPerImpression } = temp
		const errTitle = invalidFields['title']
		const errDescription = invalidFields['description']
		const errMin = invalidFields['minPerImpression']

		return (
			<div>
				<Grid container spacing={2}>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={'Ad Unit ' + t('title', { isProp: true })}
							name='name'
							value={title}
							onChange={ev => handleChange('title', ev.target.value)}
							onBlur={() => this.validateTitle(title, true)}
							onFocus={() => this.validateTitle(title, false)}
							error={errTitle && !!errTitle.dirty}
							maxLength={120}
							helperText={
								errTitle && !!errTitle.dirty
									? errTitle.errMsg
									: t('TITLE_HELPER')
							}
						/>
					</Grid>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							multiline
							rows={3}
							label={t('description', { isProp: true })}
							value={description}
							onChange={ev => handleChange('description', ev.target.value)}
							onBlur={() => this.validateDescription(description, true)}
							onFocus={() => this.validateDescription(description, false)}
							error={errDescription && !!errDescription.dirty}
							maxLength={300}
							helperText={
								errDescription && !!errDescription.dirty
									? errDescription.errMsg
									: t('DESCRIPTION_HELPER')
							}
						/>
					</Grid>
					<Grid item sm={12} md={12}>
						<Dropdown
							fullWidth
							required
							onChange={this.validateAndUpdateType.bind(this, true)}
							source={adTypes}
							value={type + ''}
							label={t('adType', { isProp: true })}
							htmlId='ad-type-dd'
							name='adType'
						/>
					</Grid>
					<Grid item sm={12} md={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('MIN_CPM_SLOT_LABEL', { args: ['DAI'] })}
							name='minPerImpression'
							value={minPerImpression}
							onChange={ev => {
								this.validateAmount(ev.target.value, 'minPerImpression', true)
								this.updateMinPerImpression(ev.target.value)
							}}
							error={errMin && !!errMin.dirty}
							maxLength={120}
							helperText={
								errMin && !!errMin.dirty
									? errMin.errMsg
									: t('SLOT_MIN_CPM_HELPER')
							}
						/>
					</Grid>
				</Grid>
			</div>
		)
	}
}

AdSlotBasic.propTypes = {
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string,
	descriptionHelperTxt: PropTypes.string,
	nameHelperTxt: PropTypes.string,
}

const NewAdSlotBasic = NewAdSlotHoc(AdSlotBasic)

export default Translate(NewAdSlotBasic)
