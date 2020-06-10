import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import OutlinedPropView from 'components/common/OutlinedPropView'

import { t } from 'selectors'
import { Box } from '@material-ui/core'

const AudiencePreview = ({ audienceInput = {}, subHeader }) => {
	const {
		location = {},
		categories = {},
		publishes = {},
		advanced = {},
	} = audienceInput
	return (
		<Box>
			<Box m={1}>
				<OutlinedPropView
					label={t('LOCATION')}
					value={(location[location.apply] || []).join(', ')}
				/>
			</Box>
			<Box m={1}></Box>
			<Box m={1}></Box>
			<Box m={1}></Box>
		</Box>
	)
}

AudiencePreview.propTypes = {
	audienceInput: PropTypes.array,
	subHeader: PropTypes.string,
}

export default AudiencePreview
