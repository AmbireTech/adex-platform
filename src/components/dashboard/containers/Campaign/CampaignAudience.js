import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import {
	Paper,
	Box,
	ExpansionPanel,
	ExpansionPanelSummary,
	Typography,
} from '@material-ui/core'
import { t, selectAudienceByCampaignId } from 'selectors'
import AudiencePreview from 'components/dashboard/containers/AudiencePreview'
import { ExpandMoreSharp as ExpandMoreIcon } from '@material-ui/icons'
import { NewCampaignFromAudience } from 'components/dashboard/forms/items/NewItems'
import { execute, updateNewCampaign } from 'actions'

export const CampaignAudience = ({ item }) => {
	const { inputs } =
		useSelector(state => selectAudienceByCampaignId(state, item.id)) || {}

	return (
		<Fragment>
			<Paper elevation={2} variant='outlined'>
				<Box p={1}>
					<AudiencePreview audienceInput={inputs} />
				</Box>
				<Box p={2}>
					<NewCampaignFromAudience
						btnLabel='NEW_CAMPAIGN_FROM_AUDIENCE'
						color='primary'
						variant='contained'
						onBeforeOpen={() =>
							execute(
								updateNewCampaign('audienceInput', {
									...inputs,
								})
							)
						}
					/>
				</Box>
			</Paper>
			<Box mt={2}>
				<ExpansionPanel square={true} variant='outlined'>
					<ExpansionPanelSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls='panel1a-content'
						id='panel1a-header'
					>
						<Typography>{t('TARGETING_RULES')}</Typography>
					</ExpansionPanelSummary>
					<Box p={1} color='grey.contrastText' bgcolor='grey.main'>
						<pre>{JSON.stringify(item.targetingRiles || {}, null, 2)}</pre>
					</Box>
				</ExpansionPanel>
			</Box>
		</Fragment>
	)
}
