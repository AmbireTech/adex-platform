import React from 'react'
import WithDialog from 'components/common/dialog/WithDialog'
import FormSteps from 'components/common/stepper/FormSteps'
import { CampaignTargetingRules } from 'components/dashboard/forms/items/NewItems'
import { execute, resetNewItem, updateCampaignAudienceInput } from 'actions'
import { Campaign } from 'adex-models'

const TargetingSteps = ({
	updateField,
	fieldName,
	stepTitle,
	itemId,
	...props
}) => {
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
					title: stepTitle || 'CAMPAIGN_AUDIENCE',
					component: CampaignTargetingRules,
					completeBtnTitle: 'OK',
					completeFn: props =>
						execute(
							updateCampaignAudienceInput({
								updateField,
								itemId,
								fieldName,
								...props,
							})
						),
				},
			]}
			itemModel={Campaign}
		/>
	)
}

export const TargetingRulesEdit = WithDialog(TargetingSteps)
