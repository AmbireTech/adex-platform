import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
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
	resetNewItem,
	updateCampaignAudienceInput,
} from 'actions'
import { Campaign } from 'adex-models'

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
	const { inputs } =
		useSelector(state => selectAudienceByCampaignId(state, item.id)) || {}

	const audienceInput = Object.keys(item.audienceInput.inputs).length
		? item.audienceInput.inputs
		: inputs

	return (
		<Fragment>
			<ChangeControls {...hookProps} />

			<Paper elevation={2} variant='outlined'>
				<Box p={1}>
					<AudiencePreview audienceInput={audienceInput} />
				</Box>
				<Box p={2}>
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

					<TargetingRulesEdit
						btnLabel='UPDATE_TAGS'
						title='UPDATE_SLOT_TAGS'
						itemId={item.id}
						disableBackdropClick
						updateField={hookProps.updateField}
						color='secondary'
						variant='contained'
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
