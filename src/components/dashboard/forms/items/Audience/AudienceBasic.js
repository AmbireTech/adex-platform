import React from 'react'
import { useSelector } from 'react-redux'

import PropTypes from 'prop-types'
import { Grid, TextField } from '@material-ui/core'

import { execute, updateNewAudience } from 'actions'
import { t, selectValidationsById, selectNewAudience } from 'selectors'

function AudienceBasic({ validateId }) {
	const { title } = useSelector(selectNewAudience)

	const { title: errTitle } = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

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
						onChange={ev =>
							execute(updateNewAudience('title', ev.target.value))
						}
						error={errTitle && !!errTitle.dirty}
						maxLength={120}
						helperText={
							errTitle && !!errTitle.dirty ? errTitle.errMsg : t('TITLE_HELPER')
						}
					/>
				</Grid>
			</Grid>
		</div>
	)
}

AudienceBasic.propTypes = {
	validateId: PropTypes.string.isRequired,
}

export default AudienceBasic
