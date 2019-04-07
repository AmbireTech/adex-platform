import React, { Component } from 'react';
import PropTypes from 'prop-types'
import NewAdUnitHoc from './NewAdUnitHoc'
import Translate from 'components/translate/Translate'
import ImgForm from 'components/dashboard/forms/ImgForm'
import Grid from '@material-ui/core/Grid'
import ValidImageHoc from 'components/dashboard/forms/ValidImageHoc'

const getWidAndHightFromType = (type) => {
	const sizes = (type.split('_')[1]).split('x')
	return {
		width: sizes[0],
		height: sizes[1]
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
		const errImg = this.props.invalidFields['mediaUrl']
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
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	title: PropTypes.string,
	newItem: PropTypes.object.isRequired
}

const NewAdUnitMedia = NewAdUnitHoc(ValidImageHoc(AdUnitMedia))

export default Translate(NewAdUnitMedia)
