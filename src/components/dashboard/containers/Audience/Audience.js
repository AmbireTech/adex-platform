import React, { Fragment, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import { Audience as AudienceModel } from 'adex-models'
import { Tabs, Tab, Box } from '@material-ui/core'
import {
	useItem,
	ChangeControls,
	ItemTitle,
	ArchiveItemBtn,
	ItemTabsContainer,
	ItemTabsBar,
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
		marginTop: theme.spacing(1),
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
	const [tabIndex, setTabIndex] = useState(0)

	const classes = useStyles()

	const { item = {}, ...hookProps } = useItem({
		itemType: 'Audience',
		match,
		objModel: AudienceModel,
		validateAndUpdateFn,
	})

	const { validations } = hookProps
	const { inputs, title, id, archived } = item
	const { title: errTitle } = validations

	return (
		<Fragment>
			<ItemTabsBar>
				<Tabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					variant='scrollable'
					scrollButtons='auto'
					indicatorColor='primary'
					textColor='primary'
				>
					<Tab label={t('AUDIENCE_MAIN')} />
				</Tabs>
			</ItemTabsBar>
			<ChangeControls {...hookProps} />
			<ItemTabsContainer>
				<Box p={1} pt={2}>
					<ItemTitle title={title} errTitle={errTitle} {...hookProps} />

					<AudiencePreview audienceInput={inputs} />

					<Box className={classes.actions}>
						<TargetingRulesEdit
							btnLabel='UPDATE_AUDIENCE'
							title='UPDATE_CAMPAIGN_AUDIENCE'
							itemId={id}
							disableBackdropClick
							updateField={hookProps.updateField}
							color='secondary'
							variant='contained'
							onClick={() =>
								execute(
									mapCurrentToNewAudience({
										itemId: id,
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
							btnLabel='NEW_AUDIENCE_FROM_THIS'
							color='primary'
							variant='contained'
							onBeforeOpen={() =>
								execute(
									updateNewAudience(null, null, {
										...item,
										title: title + ' (2)',
									})
								)
							}
						/>

						{!archived && (
							<ArchiveItemBtn
								itemType='Audience'
								itemId={id}
								title={title}
								goToTableOnSuccess
							/>
						)}
					</Box>
				</Box>
			</ItemTabsContainer>
		</Fragment>
	)
}

Audience.propTypes = {
	match: PropTypes.object.isRequired,
}

export default Audience
