import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewAdUnitHoc from './NewAdUnitHoc'
import Translate from 'components/translate/Translate'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Dropdown from 'components/common/dropdown'
import { constants, schemas, Joi } from 'adex-models'

const { adUnitPost } = schemas

const AdTypes = constants.AdUnitsTypes
	.map(type => {
		return {
			value: type,
			label: type.split('_')[1]
		}
	})

class AdUnitBasic extends Component {

	constructor(props) {
		super(props)

		const { newItem } = props
		this.validateTitle(newItem.title, false)
		this.validateDescription(newItem.description, false)
		this.validateTargetUrl(newItem.targetUrl, false)
		this.validateAndUpdateType(false, newItem.type)
	}

	validateTitle(name, dirty, errMsg) {
		const result = Joi.validate(name, adUnitPost.title)

		this.props.validate(
			'title',
			{
				isValid: !result.error,
				err: { msg: result.error ? result.error.message : '' },
				dirty: dirty
			})
	}

	validateDescription(name, dirty, errMsg) {
		const result = Joi.validate(name, adUnitPost.description)

		this.props.validate(
			'description',
			{
				isValid: !result.error,
				err: { msg: result.error ? result.error.message : '' },
				dirty: dirty
			})
	}

	validateTargetUrl(targetUrl, dirty) {
		const result = Joi.validate(targetUrl, adUnitPost.targetUrl)
		this.props.validate('targetUrl',
			{
				isValid: !result.error,
				err: { msg: result.error ? result.error.message : '' },
				dirty: dirty
			})
	}

	validateAndUpdateType = (dirty, value) => {
		const result = Joi.validate(value, adUnitPost.type)

		this.props.handleChange('type', value)
		this.props.validate('type',
			{
				isValid: !result.error,
				err: { msg: result.error ? result.error.message : '' },
				dirty: dirty
			})
	}

	render() {
		const {
			t,
			newItem,
			invalidFields,
			handleChange
		} = this.props
		const { targetUrl, type, title, description } = newItem
		const errTitle = invalidFields['title']
		const errDescription = invalidFields['description']
		const errTargetUrl = invalidFields['targetUrl']

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item sm={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('title', { isProp: true })}
							name='name'
							value={title}
							onChange={(ev) =>
								handleChange('title', ev.target.value)}
							onBlur={() => this.validateTitle(title, true)}
							onFocus={() => this.validateTitle(title, false)}
							error={errTitle && !!errTitle.dirty}
							maxLength={120}
							helperText={
								(errTitle && !!errTitle.dirty)
									? errTitle.errMsg
									: (t('TITLE_HELPER'))
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
							onChange={(ev) =>
								handleChange('description', ev.target.value)}
							onBlur={() => this.validateDescription(title, true)}
							onFocus={() => this.validateDescription(title, false)}
							error={errDescription && !!errDescription.dirty}
							maxLength={300}
							helperText={
								(errDescription && !!errDescription.dirty)
									? errDescription.errMsg
									: (t('DESCRIPTION_HELPER'))
							}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							fullWidth
							type='text'
							required
							label={t('targetUrl', { isProp: true })}
							value={targetUrl}
							onChange={(ev) =>
								handleChange('targetUrl', ev.target.value)
							}
							onBlur={() => this.validateTargetUrl(targetUrl, true)}
							onFocus={() => this.validateTargetUrl(targetUrl, false)}
							error={errTargetUrl && !!errTargetUrl.dirty}
							helperText={
								(errTargetUrl && !!errTargetUrl.dirty)
									? errTargetUrl.errMsg
									: ''
							}
						/>
					</Grid>
					<Grid item sm={12} md={12}>
						<Dropdown
							fullWidth
							required
							onChange={this.validateAndUpdateType
								.bind(this, true)}
							source={AdTypes}
							value={type + ''}
							label={t('adType', { isProp: true })}
							htmlId='ad-type-dd'
							name='adType'
						/>
					</Grid>
				</Grid>
			</div>
		)
	}
}

AdUnitBasic.propTypes = {
	newItem: PropTypes.object.isRequired,
	title: PropTypes.string,
	descriptionHelperTxt: PropTypes.string,
	nameHelperTxt: PropTypes.string,
}

const NewAdUnitBasic = NewAdUnitHoc(AdUnitBasic)

export default Translate(NewAdUnitBasic)
