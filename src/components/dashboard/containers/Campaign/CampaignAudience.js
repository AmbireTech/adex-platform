import React from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { Box, Accordion, AccordionSummary, Typography } from '@material-ui/core'
import { t, selectAudienceByCampaignId } from 'selectors'
import AudiencePreview from 'components/dashboard/containers/AudiencePreview'
import { ExpandMoreSharp as ExpandMoreIcon } from '@material-ui/icons'
import { NewCampaignFromAudience } from 'components/dashboard/forms/items/NewItems'
import {
	execute,
	updateNewCampaign,
	updateNewAudience,
	mapCurrentToNewCampaignAudienceInput,
} from 'actions'
import { NewAudienceDialog } from 'components/dashboard/forms/items/NewItems'
import { TargetingRulesEdit } from 'components/dashboard/containers/Campaign/CampaignEdits'

const useStyles = makeStyles(theme => ({
	actions: {
		'& > *': {
			marginRight: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
	},
}))

export const CampaignAudience = ({
	item,
	isActive,
	canSendMsgs,
	...hookProps
}) => {
	const classes = useStyles()
	const campaignAudienceInput =
		useSelector(state => selectAudienceByCampaignId(state, item.id)) || {}

	const audienceInput =
		item.audienceInput && Object.keys(item.audienceInput.inputs).length
			? item.audienceInput
			: campaignAudienceInput

	return (
		<Box>
			<Box>
				<Box>
					<AudiencePreview audienceInput={audienceInput.inputs} />
				</Box>
				<Box className={classes.actions}>
					{isActive && (
						<TargetingRulesEdit
							btnLabel='UPDATE_AUDIENCE'
							title='UPDATE_CAMPAIGN_AUDIENCE'
							itemId={item.id}
							disabled={!canSendMsgs}
							disableBackdropClick
							updateField={hookProps.updateField}
							color='secondary'
							variant='contained'
							onClick={() =>
								execute(
									mapCurrentToNewCampaignAudienceInput({
										itemId: item.id,
										dirtyProps: hookProps.dirtyProps,
									})
								)
							}
						/>
					)}

					<NewCampaignFromAudience
						btnLabel='NEW_CAMPAIGN_FROM_AUDIENCE'
						color='primary'
						variant='contained'
						onBeforeOpen={() =>
							execute(
								updateNewCampaign('audienceInput', {
									...audienceInput,
								})
							)
						}
					/>

					<NewAudienceDialog
						btnLabel='SAVE_AUDIENCE'
						title='CREATE_NEW_AUDIENCE'
						color='primary'
						variant='contained'
						onBeforeOpen={() =>
							execute(
								updateNewAudience(null, null, {
									...audienceInput,
								})
							)
						}
					/>
				</Box>
			</Box>
			<Box>
				<Accordion variant='outlined'>
					<AccordionSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls='targeting-rules-content'
						id='targeting-rules-header'
					>
						<Typography>{t('TARGETING_RULES')}</Typography>
					</AccordionSummary>
					<Box p={1} color='grey.contrastText' bgcolor='grey.main'>
						<pre>
							{JSON.stringify(
								item.targetingRules || item.spec.targetingRules || [],
								null,
								2
							)}
						</pre>
					</Box>
				</Accordion>
			</Box>
		</Box>
	)
}
