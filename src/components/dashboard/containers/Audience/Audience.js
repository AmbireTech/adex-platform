import React, { Fragment, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { Audience as AudienceModel } from 'adex-models'
import { Paper, Box } from '@material-ui/core'
import {
	useItem,
	ChangeControls,
} from 'components/dashboard/containers/ItemCommon/'
import AudiencePreview from 'components/dashboard/containers/AudiencePreview'
import FormSteps from 'components/common/stepper/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
import {
	NewCampaignFromAudience,
	AudienceRules,
} from 'components/dashboard/forms/items/NewItems'
import {
	execute,
	updateNewCampaign,
	updateNewAudience,
	resetNewItem,
	updateAudienceInput,
	mapCurrentToNewAudience,
} from 'actions'
import { NewAudienceDialog } from 'components/dashboard/forms/items/NewItems'

import { validateAndUpdateAudience as validateAndUpdateFn } from 'actions'
import { t } from 'selectors'

const useStyles = makeStyles(theme => ({
	actions: {
		'& > *': {
			margin: theme.spacing(1),
		},
	},
}))

export const TargetingSteps = ({ updateField, itemId, ...props }) => {
	return (
		<FormSteps
			{...props}
			cancelFunction={() => execute(resetNewItem('Audience', itemId))}
			itemId={itemId}
			validateIdBase={`update-audience-${itemId}-`}
			itemType='Audience'
			stepsId={`update-campaign-${itemId}`}
			steps={[
				{
					title: 'SAVED_AUDIENCE',
					component: AudienceRules,
					completeBtnTitle: 'OK',
					completeFn: props =>
						execute(updateAudienceInput({ updateField, itemId, ...props })),
				},
			]}
			itemModel={AudienceModel}
		/>
	)
}

const TargetingRulesEdit = WithDialog(TargetingSteps)

function Audience({ match }) {
	const classes = useStyles()

	const { item = {}, ...hookProps } = useItem({
		itemType: 'Audience',
		match,
		objModel: AudienceModel,
		validateAndUpdateFn,
	})

	const { inputs, title } = item

	return (
		<Fragment>
			<ChangeControls {...hookProps} />

			<Paper variant='outlined'>
				<AudiencePreview audienceInput={inputs} title={title} />
				<Box p={1} className={classes.actions}>
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
								mapCurrentToNewAudience({
									itemId: item.id,
									dirtyProps: hookProps.dirtyProps,
								})
							)
						}
					/>

					<NewCampaignFromAudience
						btnLabel='NEW_CAMPAIGN_FROM_AUDIENCE'
						color='primary'
						variant='contained'
						onBeforeOpen={() =>
							execute(
								updateNewCampaign('audienceInput', {
									...item,
								})
							)
						}
					/>

					<NewAudienceDialog
						btnLabel='NEW_AUDIENCE'
						color='primary'
						variant='contained'
						onBeforeOpen={() =>
							execute(
								updateNewAudience(null, null, {
									...item,
									title: item.title + ' (2)',
								})
							)
						}
					/>
				</Box>
			</Paper>
		</Fragment>
	)
}

Audience.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Audience
