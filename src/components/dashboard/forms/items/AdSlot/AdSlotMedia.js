import React, { Component } from 'react'
import PropTypes from 'prop-types'
import NewAdSlotHoc from './NewAdSlotHoc'
import Translate from 'components/translate/Translate'
import ImgForm from 'components/dashboard/forms/ImgForm'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import ValidImageHoc from 'components/dashboard/forms/ValidImageHoc'
import Collapse from '@material-ui/core/Collapse'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import FormHelperText from '@material-ui/core/FormHelperText'
import Switch from '@material-ui/core/Switch'
import { schemas, Joi } from 'adex-models'

const { adUnitPost } = schemas

const getWidAndHightFromType = type => {
	type = type || 'legacy_300x250'
	if (!type) {
		return {
			width: 0,
			height: 0,
		}
	}

	const sizes = type.split('_')[1].split('x')
	return {
		width: parseInt(sizes[0], 10),
		height: parseInt(sizes[1], 10),
	}
}

class AdSlotMedia extends Component {
	componentDidMount() {
		const { newItem } = this.props
		const { temp, targetUrl } = newItem
		const { useFallback } = temp

		if (useFallback) {
			this.validateImage(useFallback)
			this.validateFallbackUrl(targetUrl, true, useFallback)
		}
	}

	validateImage = useFallback => {
		const { newItem, validate, validateMedia } = this.props
		const { type, temp } = newItem
		const { tempUrl, mime } = temp

		const { width, height } = getWidAndHightFromType(type)

		if (!useFallback) {
			validate('temp', {
				isValid: true,
				err: {
					msg: 'ERR_IMG_SIZE_EXACT',
					args: [width, height, 'px'],
				},
				dirty: true,
			})
		} else if (tempUrl) {
			validateMedia(
				{
					propsName: 'temp',
					widthTarget: width,
					heightTarget: height,
					msg: 'ERR_IMG_SIZE_EXACT',
					exact: true,
					required: true,
				},
				{
					tempUrl,
					mime,
				}
			)
		}
	}

	validateFallbackUrl = (targetUrl, dirty, useFallback) => {
		const result = Joi.validate(targetUrl, adUnitPost.targetUrl)
		this.props.validate('targetUrl', {
			isValid: !useFallback || !result.error,
			err: { msg: result.error ? result.error.message : '' },
			dirty: dirty,
		})
	}

	handleFallbackChange = useFallback => {
		const { temp, targetUrl } = this.props.newItem
		const newTemp = { ...temp }
		newTemp.useFallback = useFallback

		this.props.handleChange('temp', newTemp)
		this.validateFallbackUrl(targetUrl, null, useFallback)
		this.validateImage(useFallback)
	}

	handleImgChange = (prop, img) => {
		const { newItem, handleChange } = this.props
		const newTemp = { ...newItem.temp, ...img }
		handleChange(prop, newTemp)
	}

	render() {
		const {
			newItem,
			t,
			validateMedia,
			invalidFields,
			handleChange,
		} = this.props
		const { targetUrl, type, temp } = newItem
		const useFallback = temp.useFallback || false
		const errImg = this.props.invalidFields['temp']
		const errFallbackUrl = invalidFields['targetUrl']
		const { width, height } = getWidAndHightFromType(type)

		return (
			<div>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<FormControlLabel
							control={
								<Switch
									checked={useFallback}
									onChange={ev => this.handleFallbackChange(ev.target.checked)}
								/>
							}
							label={t('USE_FALLBACK_DATA')}
						/>
						<FormHelperText>{t('USE_FALLBACK_DATA_INFO')}</FormHelperText>
					</Grid>
					<Collapse in={useFallback}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField
									fullWidth
									type='text'
									required
									label={t('targetUrl', { isProp: true })}
									value={targetUrl}
									onChange={ev => handleChange('targetUrl', ev.target.value)}
									onBlur={() =>
										this.validateFallbackUrl(targetUrl, true, useFallback)
									}
									onFocus={() =>
										this.validateFallbackUrl(targetUrl, false, useFallback)
									}
									error={errFallbackUrl && !!errFallbackUrl.dirty}
									helperText={
										errFallbackUrl && !!errFallbackUrl.dirty
											? errFallbackUrl.errMsg
											: t('FALLBACKTARGETURL_HELPER')
									}
								/>
							</Grid>
							<Grid item sm={12}>
								<ImgForm
									label={t('SLOT_FALLBACK_MEDIA_LABEL')}
									imgSrc={temp.tempUrl || ''}
									onChange={validateMedia.bind(this, {
										propsName: 'temp',
										widthTarget: width,
										heightTarget: height,
										msg: 'ERR_IMG_SIZE_EXACT',
										exact: true,
										required: true,
										onChange: this.handleImgChange,
									})}
									additionalInfo={t('SLOT_FALLBACK_MEDIA_INFO', {
										args: [width, height, 'px'],
									})}
									errMsg={errImg ? errImg.errMsg : ''}
									size={{
										width: width,
										height: height,
									}}
								/>
							</Grid>
						</Grid>
					</Collapse>
				</Grid>
			</div>
		)
	}
}

AdSlotMedia.propTypes = {
	title: PropTypes.string,
	newItem: PropTypes.object.isRequired,
}

const NewAdSlotMedia = NewAdSlotHoc(ValidImageHoc(AdSlotMedia))

export default Translate(NewAdSlotMedia)
