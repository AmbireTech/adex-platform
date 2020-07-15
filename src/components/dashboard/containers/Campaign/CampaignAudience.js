import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import {
	Paper,
	Box,
	ExpansionPanel,
	ExpansionPanelSummary,
	Typography,
} from '@material-ui/core'
import WithDialog from 'components/common/dialog/WithDialog'
import { t, selectAudienceByCampaignId } from 'selectors'
import AudiencePreview from 'components/dashboard/containers/AudiencePreview'
import FormSteps from 'components/common/stepper/FormSteps'
import { ExpandMoreSharp as ExpandMoreIcon } from '@material-ui/icons'
import { ChangeControls } from 'components/dashboard/containers/ItemCommon/'
import {
	NewCampaignFromAudience,
	CampaignTargetingRules,
} from 'components/dashboard/forms/items/NewItems'
import {
	execute,
	updateNewCampaign,
	updateNewAudience,
	resetNewItem,
	updateCampaignAudienceInput,
	mapCurrentToNewCampaignAudienceInput,
} from 'actions'
import { Campaign } from 'adex-models'
import { NewAudienceDialog } from 'components/dashboard/forms/items/NewItems'

const useStyles = makeStyles(theme => ({
	actions: {
		'& > *': {
			marginRight: theme.spacing(1),
			marginBottom: theme.spacing(1),
		},
	},
}))

export const TargetingSteps = ({ updateField, itemId, ...props }) => {
	return (
		<FormSteps
			{...props}
			cancelFunction={() => execute(resetNewItem('Campaign', itemId))}
			itemId={itemId}
			validateIdBase={`update-campaign-${itemId}-`}
			itemType='Campaign'
			stepsId={`update-campaign-${itemId}`}
			steps={[
				{
					title: 'CAMPAIGN_AUDIENCE',
					component: CampaignTargetingRules,
					completeBtnTitle: 'OK',
					completeFn: props =>
						execute(
							updateCampaignAudienceInput({ updateField, itemId, ...props })
						),
				},
			]}
			itemModel={Campaign}
		/>
	)
}

const TargetingRulesEdit = WithDialog(TargetingSteps)

export const CampaignAudience = ({ item, ...hookProps }) => {
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
					{['Ready', 'Active', 'Unhealthy'].includes(item.status.name) && (
						<TargetingRulesEdit
							btnLabel='UPDATE_AUDIENCE'
							title='UPDATE_CAMPAIGN_AUDIENCE'
							itemId={item.id}
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
				<ExpansionPanel square={true} variant='outlined'>
					<ExpansionPanelSummary
						expandIcon={<ExpandMoreIcon />}
						aria-controls='targeting-rules-content'
						id='targeting-rules-header'
					>
						<Typography>{t('TARGETING_RULES')}</Typography>
					</ExpansionPanelSummary>
					<Box p={1} color='grey.contrastText' bgcolor='grey.main'>
						<pre>
							{JSON.stringify(
								item.targetingRules || item.spec.targetingRules || [],
								null,
								2
							)}
						</pre>
					</Box>
				</ExpansionPanel>
			</Box>
		</Box>
	)
}
