import React, { Fragment, useState } from 'react'
import PropTypes from 'prop-types'
import { Audience as AudienceModel } from 'adex-models'
import { Paper } from '@material-ui/core'
import { useItem } from 'components/dashboard/containers/ItemCommon/'
import AudiencePreview from 'components/dashboard/containers/AudiencePreview'
// import { validateAndUpdateAudience as validateAndUpdateFn } from 'actions'
import { t } from 'selectors'

function Audience({ match }) {
	const { item, ...hookProps } = useItem({
		itemType: 'Audience',
		match,
		objModel: AudienceModel,
		// validateAndUpdateFn,
	})

	return (
		<Fragment>
			<Paper variant='outlined'>
				<AudiencePreview audienceInput={item.inputs} />
			</Paper>
		</Fragment>
	)
}

Audience.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Audience
