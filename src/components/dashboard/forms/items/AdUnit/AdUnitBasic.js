import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { Grid, TextField } from '@material-ui/core'
import Dropdown from 'components/common/dropdown'
import { execute, updateNewUnit } from 'actions'
import {
	t,
	selectValidationsById,
	selectNewAdUnit,
	selectUnitTypesSourceWithRecommendations,
} from 'selectors'

function AdUnitBasic({ validateId }) {
	const { title, description, targetUrl, type } = useSelector(selectNewAdUnit)
	const typesSources = useSelector(selectUnitTypesSourceWithRecommendations)

	const {
		title: errTitle,
		description: errDescription,
		targetUrl: errTargetUrl,
		type: errType,
	} = useSelector(state => selectValidationsById(state, validateId) || {})

	return (
		<div>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<TextField
						fullWidth
						variant='outlined'
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
						variant='outlined'
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
						variant='outlined'
						type='text'
						required
						label={t('targetUrl', { isProp: true })}
						value={targetUrl}
						onChange={ev =>
							execute(
								updateNewUnit('targetUrl', (ev.target.value || '').trim())
							)
						}
						error={errTargetUrl && !!errTargetUrl.dirty}
						helperText={
							errTargetUrl && !!errTargetUrl.dirty
								? errTargetUrl.errMsg
								: t('TARGETURL_HELPER')
						}
					/>
				</Grid>
				<Grid item xs={12}>
					<Dropdown
						fullWidth
						variant='outlined'
						required
						onChange={value => execute(updateNewUnit('type', value))}
						source={typesSources}
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
