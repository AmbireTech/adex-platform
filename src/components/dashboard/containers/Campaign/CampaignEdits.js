import React from 'react'
import { InputAdornment, IconButton, TextField } from '@material-ui/core'
import { Edit, UndoOutlined } from '@material-ui/icons'
import WithDialog from 'components/common/dialog/WithDialog'
import FormSteps from 'components/common/stepper/FormSteps'
import { CampaignTargetingRules } from 'components/dashboard/forms/items/NewItems'
import {
	execute,
	resetNewItem,
	updateCampaignAudienceInput,
	validateNumberString,
} from 'actions'
import { t } from 'selectors'
import { Campaign } from 'adex-models'
import { BigNumber } from 'ethers'
import { formatTokenAmount } from 'helpers/formatters'
import { validPositiveInt } from 'helpers/validators'

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

export const MinCPM = ({
	minPerImpression,
	decimals,
	symbol,
	validations,
	updateField,
	setActiveFields,
	returnPropToInitialState,
	activeFields = {},
	dirtyProps,
	validateId,
}) => {
	const err = validations['minPerImpression']
	const active = !!activeFields.minPerImpression
	const showError = !!err && err.dirty
	const isDirty = dirtyProps && dirtyProps.includes('minPerImpression')
	return (
		<TextField
			margin='dense'
			fullWidth
			id='min-CPM'
			label={t('CPM_MIN')}
			type='text'
			name='minPerImpression'
			value={
				(!isDirty && validPositiveInt(minPerImpression)
					? formatTokenAmount(
							BigNumber.from(minPerImpression || 0).mul(1000),
							decimals,
							true
					  )
					: minPerImpression) + (active ? '' : ' ' + symbol)
			}
			onChange={ev => {
				updateField('minPerImpression', ev.target.value)
				execute(
					validateNumberString({
						validateId,
						prop: `minPerImpression`,
						value: ev.target.value,
						dirty: true,
					})
				)
			}}
			disabled={!active}
			error={showError}
			helperText={showError ? t(err.errMsg, { args: err.errMsgArgs }) : ''}
			variant='outlined'
			InputProps={{
				endAdornment: (
					<InputAdornment position='end'>
						<IconButton
							// size='small'
							color='secondary'
							onClick={() =>
								active
									? returnPropToInitialState('minPerImpression')
									: setActiveFields('minPerImpression', true)
							}
						>
							{active ? <UndoOutlined /> : <Edit />}
						</IconButton>
					</InputAdornment>
				),
			}}
		/>
	)
}
