import React from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { Grid, TextField } from '@material-ui/core'
import { t, selectValidationsById, selectNewWebsite } from 'selectors'
import { updateNewWebsite, execute } from 'actions'

function AdSlotBasic({ validateId }) {
	const newItem = useSelector(selectNewWebsite)

	const { website = '' } = newItem

	const { website: errWebsite } = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	return (
		<div>
			<Grid container spacing={2}>
				<Grid item xs={12}>
					<TextField
						variant='outlined'
						value={website}
						fullWidth
						label={t('SLOT_WEBSITE')}
						error={errWebsite && !!errWebsite.dirty}
						helperText={
							errWebsite && !!errWebsite.dirty ? (
								errWebsite.errMsg
							) : (
								<span
									dangerouslySetInnerHTML={{
										__html: t('SLOT_WEBSITE_CODE_WARNING'),
									}}
								/>
							)
						}
						onChange={ev => {
							execute(
								updateNewWebsite('website', (ev.target.value || '').trim())
							)
						}}
					/>
				</Grid>
			</Grid>
		</div>
	)
}

AdSlotBasic.propTypes = {
	validateId: PropTypes.string.isRequired,
}

export default AdSlotBasic
