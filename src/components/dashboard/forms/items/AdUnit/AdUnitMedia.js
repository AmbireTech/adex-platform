import React, { Component } from 'react';
import PropTypes from 'prop-types'
import NewAdUnitHoc from './NewAdUnitHoc'
import Translate from 'components/translate/Translate'
import ImgForm from 'components/dashboard/forms/ImgForm'
import Grid from '@material-ui/core/Grid'
import ValidImageHoc from 'components/dashboard/forms/ValidImageHoc'

const getWidAndHightFromType = (type) => {
	type = type || 'legacy_300x250'
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

class AdUnitMedia extends Component {

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
	}

	render() {
		const { newItem, t, validateImg } = this.props
		const { type, temp } = newItem
		const errImg = this.props.invalidFields['temp']
		const { width, height } = getWidAndHightFromType(type)

		return (
			<div>
				<Grid
					container
				>
					<Grid item sm={12}>
						<ImgForm
							label={t('UNIT_BANNER_IMG_LABEL')}
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
							additionalInfo={t('UNIT_BANNER_IMG_INFO',
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

AdUnitMedia.propTypes = {
	title: PropTypes.string,
	newItem: PropTypes.object.isRequired
}

const NewAdUnitMedia = NewAdUnitHoc(ValidImageHoc(AdUnitMedia))

export default Translate(NewAdUnitMedia)
