import React, { useCallback, useEffect } from 'react'
import { useSelector } from 'react-redux'

import PropTypes from 'prop-types'
import { Grid, TextField, Button } from '@material-ui/core'

import Dropdown from 'components/common/dropdown'
import { constants } from 'adex-models'

import { addUrlUtmTracking } from 'helpers/utmHelpers'
import { execute, updateNewUnit } from 'actions'
import { t, selectValidationsById, selectNewAdUnit } from 'selectors'

const AdTypes = constants.AdUnitsTypes.map(type => {
	return {
		value: type,
		label: type.split('_')[1],
	}
})

function AdUnitBasic({ validateId }) {
	const { title, description, targetUrl, type, temp } = useSelector(
		selectNewAdUnit
	)
	const { autoUtmAdded } = temp
	const {
		title: errTitle,
		description: errDescription,
		targetUrl: errTargetUrl,
		type: errType,
	} = useSelector(state => selectValidationsById(state, validateId) || {})

	const updateUtmParameters = useCallback(
		removeFromUrl => {
			if (targetUrl) {
				const withUTM = addUrlUtmTracking({
					targetUrl,
					campaign: title,
					content: type,
					removeFromUrl,
				})

				execute(updateNewUnit('targetUrl', withUTM))
			}
		},
		[targetUrl, title, type]
	)

	const handleUtmButton = useCallback(() => {
		if (targetUrl) {
			execute(updateNewUnit('temp', { ...temp, autoUtmAdded: !autoUtmAdded }))
			updateUtmParameters(autoUtmAdded)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [autoUtmAdded, targetUrl, title, type])

	useEffect(() => {
		autoUtmAdded && updateUtmParameters()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [title, type])

	return (
		<div>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<TextField
						fullWidth
						type='text'
						required
						label={t('title', { isProp: true })}
						name='title'
						value={title}
						onChange={ev => execute(updateNewUnit('title', ev.target.value))}
						error={errTitle && !!errTitle.dirty}
						maxLength={120}
						helperText={
							errTitle && !!errTitle.dirty ? errTitle.errMsg : t('TITLE_HELPER')
						}
					/>
				</Grid>
				<Grid item xs={12}>
					<TextField
						fullWidth
						type='text'
						multiline
						rows={3}
						label={t('description', { isProp: true })}
						value={description}
						onChange={ev =>
							execute(updateNewUnit('description', ev.target.value))
						}
						error={errDescription && !!errDescription.dirty}
						maxLength={300}
						helperText={
							errDescription && !!errDescription.dirty
								? errDescription.errMsg
								: t('DESCRIPTION_HELPER')
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
						onChange={ev =>
							execute(updateNewUnit('targetUrl', ev.target.value))
						}
						error={errTargetUrl && !!errTargetUrl.dirty}
						helperText={
							errTargetUrl && !!errTargetUrl.dirty
								? errTargetUrl.errMsg
								: t('TARGETIRL_HELPER')
						}
					/>
				</Grid>
				<Grid item xs={12}>
					<Button
						onClick={handleUtmButton}
						color={!autoUtmAdded ? 'primary' : 'secondary'}
						variant='contained'
					>
						{!autoUtmAdded ? t('ADD_UTM_LINK') : t('REMOVE_UTM_LINK')}
					</Button>
				</Grid>
				<Grid item xs={12}>
					<Dropdown
						fullWidth
						required
						onChange={value => execute(updateNewUnit('type', value))}
						source={AdTypes}
						value={type + ''}
						label={t('adType', { isProp: true })}
						htmlId='ad-type-dd'
						name='adType'
						error={errType && !!errType.dirty}
						helperText={
							errType && !!errType.dirty
								? errType.errMsg
								: t('UNIT_TYPE_HELPER')
						}
					/>
				</Grid>
			</Grid>
		</div>
	)
}

AdUnitBasic.propTypes = {
	validateId: PropTypes.string.isRequired,
}

export default AdUnitBasic
