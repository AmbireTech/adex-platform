import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewAdSlotHoc from './NewAdSlotHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Dropdown from 'components/common/dropdown'
import { utils } from 'ethers'
import { validations, constants, schemas, Joi } from 'adex-models'

const { adSlotPost } = schemas

const AdTypes = constants.AdUnitsTypes.map(type => {
	return {
		value: type,
		label: type.split('_')[1],
	}
})

class AdSlotBasic extends Component {
	componentDidMount() {
		const { newItem } = this.props
		this.validateTitle(newItem.title, false)
		this.validateDescription(newItem.description, false)
		this.validateTargetUrl(newItem.targetUrl, false)
		this.validateAndUpdateType(false, newItem.type)
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

	isUrl(str) {
		const regex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/gm
		let isValid = regex.test(str)
		return isValid
	}

	validateTargetUrl(value = '', dirty, errMsg) {
		const isValidURL = this.isUrl(value)
		this.props.validate('targetUrl', {
			isValid: isValidURL,
			err: { msg: errMsg || 'ERR_INVALID_URL' },
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
		const { type, title, description, temp, targetUrl } = newItem
		const { minPerImpression } = temp
		const errTitle = invalidFields['title']
		const errUrl = invalidFields['targetUrl']
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
							label={'Ad Slot ' + t('title', { isProp: true })}
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
							required
							label={'Ad Slot ' + t('Url', { isProp: true })}
							name='url'
							value={targetUrl}
							onChange={ev => handleChange('targetUrl', ev.target.value)}
							onBlur={() => this.validateTargetUrl(targetUrl, true)}
							onFocus={() => this.validateTargetUrl(targetUrl, false)}
							error={errUrl && !!errUrl.dirty}
							maxLength={120}
							helperText={
								errUrl && !!errUrl.dirty ? errUrl.errMsg : t('URL_HELPER')
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
							source={AdTypes}
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
