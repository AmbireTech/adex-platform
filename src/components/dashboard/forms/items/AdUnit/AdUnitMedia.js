import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import ImgForm from 'components/dashboard/forms/ImgForm'
import { Grid } from '@material-ui/core'
import { getWidAndHightFromType } from 'helpers/itemsHelpers'
import { updateNewUnit, execute } from 'actions'
import { t, selectNewAdUnit, selectValidationsById } from 'selectors'

function AdUnitMedia({ validateId }) {
	const { type, temp } = useSelector(selectNewAdUnit)
	const { temp: errImg } = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)
	const { width, height } = getWidAndHightFromType(type)
	const { tempUrl, mime } = temp

	return (
		<div>
			<Grid container>
				<Grid item xs={12}>
					<ImgForm
						label={t('UNIT_BANNER_IMG_LABEL')}
						imgSrc={tempUrl || ''}
						mime={mime || ''}
						onChange={mediaProps =>
							execute(
								updateNewUnit('temp', {
									...temp,
									...mediaProps,
								})
							)
						}
						additionalInfo={t('UNIT_BANNER_IMG_INFO', {
							args: [width, height, 'px'],
						})}
						errMsg={errImg && errImg.dirty ? errImg.errMsg : ''}
						size={{
							width: width,
							height: height,
						}}
					/>
				</Grid>
			</Grid>
		</div>
	)
}

AdUnitMedia.propTypes = {
	validateId: PropTypes.string.isRequired,
}

export default AdUnitMedia
