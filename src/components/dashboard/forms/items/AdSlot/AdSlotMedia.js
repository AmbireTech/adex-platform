import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import MediaForm from 'components/dashboard/forms/MediaForm'
import {
	Grid,
	TextField,
	Collapse,
	FormControlLabel,
	Switch,
} from '@material-ui/core'
import { getWidAndHightFromType } from 'helpers/itemsHelpers'
import OutlinedPropView from 'components/common/OutlinedPropView'
import { t, selectNewItemByTypeAndId, selectValidationsById } from 'selectors'
import { updateNewSlot, execute } from 'actions'

function AdSlotMedia({ validateId, itemId }) {
	const { type, targetUrl, temp } = useSelector(state =>
		selectNewItemByTypeAndId(state, 'AdSlot', itemId)
	)

	const { useFallback = false, tempUrl, mime } = temp

	const { temp: errImg, targetUrl: errFallbackUrl } = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)
	const { width, height } = getWidAndHightFromType(type)

	return (
		<div>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<OutlinedPropView
						label={t('USE_FALLBACK_DATA')}
						value={
							<FormControlLabel
								control={
									<Switch
										checked={useFallback}
										onChange={ev =>
											execute(
												updateNewSlot(
													'temp',
													{
														...temp,
														useFallback: ev.target.checked,
													},
													null,
													itemId
												)
											)
										}
									/>
								}
								label={t('USE_FALLBACK_DATA_INFO')}
							/>
						}
					/>
				</Grid>

				<Grid item xs={12}>
					<Collapse in={useFallback}>
						<Grid container spacing={2}>
							<Grid item xs={12}>
								<TextField
									fullWidth
									variant='outlined'
									type='text'
									required
									label={t('targetUrl', { isProp: true })}
									value={targetUrl}
									onChange={ev =>
										execute(
											updateNewSlot('targetUrl', ev.target.value, null, itemId)
										)
									}
									error={errFallbackUrl && !!errFallbackUrl.dirty}
									helperText={
										errFallbackUrl && !!errFallbackUrl.dirty
											? errFallbackUrl.errMsg
											: t('FALLBACKTARGETURL_HELPER')
									}
								/>
							</Grid>
							<Grid item xs={12}>
								<MediaForm
									label={t('SLOT_FALLBACK_MEDIA_LABEL')}
									src={tempUrl || ''}
									mime={mime || ''}
									onChange={mediaProps =>
										execute(
											updateNewSlot(
												'temp',
												{
													...temp,
													...mediaProps,
												},
												null,
												itemId
											)
										)
									}
									additionalInfo={t('SLOT_FALLBACK_MEDIA_INFO', {
										args: [width, height, 'px'],
									})}
									errMsg={errImg && errImg.dirty ? errImg.errMsg : ''}
									size={{
										width,
										height,
									}}
								/>
							</Grid>
						</Grid>
					</Collapse>
				</Grid>
			</Grid>
		</div>
	)
}

AdSlotMedia.propTypes = {
	validateId: PropTypes.string.isRequired,
}

export default AdSlotMedia
