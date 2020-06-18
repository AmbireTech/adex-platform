import React from 'react'
import { useSelector } from 'react-redux'
import { ContentBox, ContentBody } from 'components/common/dialog/content'
import AudiencePreview from 'components/dashboard/containers/AudiencePreview'
import { selectNewAudience } from 'selectors'

function AdUnitPreview() {
	const { title, inputs, version } = useSelector(selectNewAudience)

	return (
		<ContentBox>
			<ContentBody>
				<AudiencePreview audienceInput={inputs} title={title} />
			</ContentBody>
		</ContentBox>
	)
}

export default AdUnitPreview
