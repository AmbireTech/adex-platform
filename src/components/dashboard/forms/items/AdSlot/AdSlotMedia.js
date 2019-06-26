import React, { Component } from 'react';
import PropTypes from 'prop-types'
import NewAdSlotHoc from './NewAdSlotHoc'
import Translate from 'components/translate/Translate'
import ImgForm from 'components/dashboard/forms/ImgForm'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Checkbox from '@material-ui/core/Checkbox'
import ValidImageHoc from 'components/dashboard/forms/ValidImageHoc'
import { schemas, Joi } from 'adex-models'

const { adUnitPost } = schemas


const getWidAndHightFromType = (type) => {
	if (!type) {
		return {
			width: 0,
			height: 0
		}
	}

	const sizes = (type.split('_')[1]).split('x')
	return {
		width: parseInt(sizes[0], 10),
		height: parseInt(sizes[1], 10)
	}
}

class AdSlotMedia extends Component {

	componentDidMount() {
		const { newItem, validate } = this.props
		const { type, temp } = newItem
		const { tempUrl } = temp

		const { width, height } =
			getWidAndHightFromType(type)

		if (tempUrl) {
			const isValidMediaSize =
				(temp.width === width) &&
				(temp.height === height)

			validate('temp', {
				isValid: isValidMediaSize,
				err: {
					msg: 'ERR_IMG_SIZE_EXACT',
					args: [width, height, 'px']
				},
				dirty: true
			})
		} else {
			validate('temp', {
				isValid: false,
				err: { msg: 'ERR_REQUIRED_FIELD' },
				dirty: false
			})
		}

		this.validateFallbackUrl(newItem.targetUrl, false)
	}

	validateFallbackUrl = (targetUrl, dirty) => {
		const { useFallback } = this.props.newItem.temp
		const result = Joi.validate(targetUrl, adUnitPost.targetUrl)
		this.props.validate('targetUrl',
			{
				isValid: !useFallback || !result.error,
				err: { msg: result.error ? result.error.message : '' },
				dirty: dirty
			})
	}

	handleFallbackChange = (useFallback) => {
		const { temp } = this.props.newItem
		const newTemp = { ...temp }
		newTemp.useFallback = useFallback

		this.props.handleChange('temp', newTemp)
	}

	render() {
		const {
			newItem,
			t,
			validateImg,
			invalidFields,
			handleChange
		} = this.props
		const { targetUrl, type, temp } = newItem
		const errImg = this.props.invalidFields['temp']
		const errFallbackUrl = invalidFields['targetUrl']
		const { width, height } = getWidAndHightFromType(type)

		return (
			<div>
				<Grid
					container
					spacing={16}
				>
					<Grid item xs={12}>
						<Checkbox
							checked={temp.useFallback || false}
							onChange={ev => this.handleFallbackChange(ev.target.checked)}
							value='useFallback'
							inputProps={{
								'aria-label': 'useFallback checkbox',
							}}
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
							onBlur={() => this.validateFallbackUrl(targetUrl, true)}
							onFocus={() => this.validateFallbackUrl(targetUrl, false)}
							error={errFallbackUrl && !!errFallbackUrl.dirty}
							helperText={
								(errFallbackUrl && !!errFallbackUrl.dirty)
									? errFallbackUrl.errMsg
									: t('FALLBACKTARGETURL_HELPER')
							}
						/>
					</Grid>
					<Grid item sm={12}>
						<ImgForm
							label={t('SLOT_FALLBACK_MEDIA_LABEL')}
							imgSrc={temp.tempUrl || ''}
							onChange={
								validateImg.bind(this,
									{
										propsName: 'temp',
										widthTarget: width,
										heightTarget: height,
										msg: 'ERR_IMG_SIZE_EXACT',
										exact: true,
										required: true
									})
							}
							additionalInfo={t('SLOT_FALLBACK_MEDIA_INFO',
								{
									args: [width, height, 'px']
								})}
							errMsg={errImg ? errImg.errMsg : ''}
							size={{
								width: width,
								height: height
							}}
						/>
					</Grid>
				</Grid>
			</div >
		)
	}
}

AdSlotMedia.propTypes = {
	title: PropTypes.string,
	newItem: PropTypes.object.isRequired
}

const NewAdSlotMedia = NewAdSlotHoc(ValidImageHoc(AdSlotMedia))

export default Translate(NewAdSlotMedia)
