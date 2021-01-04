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
import { Campaign, helpers } from 'adex-models'
import { BigNumber } from 'ethers'
import { formatTokenAmount } from 'helpers/formatters'
const { bondPerActionToUserInputPerMileValue } = helpers

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

export const EditCPM = ({
	prop,
	label,
	pricingBoundsCPMUserInput,
	action,
	actionValue,
	valuePerAction,
	updatedValue,
	decimals,
	symbol,
	validations,
	updateField,
	setActiveFields,
	returnPropToInitialState,
	activeFields = {},
	dirtyProps,
	validateId,
	canSendMsgs,
	specPricingBounds,
}) => {
	const err = validations[prop]
	const active = !!activeFields[prop]
	const showError = !!err && err.dirty
	const isDirty = dirtyProps && dirtyProps.includes(prop)

	const value = isDirty
		? updatedValue
		: pricingBoundsCPMUserInput &&
		  pricingBoundsCPMUserInput[action] &&
		  !!pricingBoundsCPMUserInput[action][actionValue]
		? pricingBoundsCPMUserInput[action][actionValue]
		: formatTokenAmount(
				BigNumber.from(valuePerAction || 0).mul(1000),
				decimals,
				true
		  )
	return (
		<TextField
			margin='dense'
			fullWidth
			id={prop}
			label={t(label)}
			type='text'
			name={prop}
			value={value + (active ? '' : ' ' + symbol)}
			onChange={ev => {
				const value = (ev.target.value || '').trim()
				updateField(prop, value)
				execute(
					validateNumberString({
						validateId,
						prop,
						value,
						dirty: true,
					})
				)
			}}
			disabled={!active}
			error={showError}
			helperText={
				showError
					? t(err.errMsg, { args: err.errMsgArgs })
					: active && specPricingBounds && specPricingBounds[action]
					? t(
							`BOUNDS_${actionValue.toUpperCase()}_EDIT`,

							{
								args: [
									bondPerActionToUserInputPerMileValue(
										specPricingBounds[action][actionValue],
										decimals
									),
									symbol,
								],
							}
					  )
					: ''
			}
			variant='outlined'
			InputProps={{
				endAdornment: canSendMsgs ? (
					<InputAdornment position='end'>
						<IconButton
							// size='small'
							color='secondary'
							onClick={() =>
								active
									? returnPropToInitialState(prop)
									: setActiveFields(prop, true)
							}
						>
							{active ? <UndoOutlined /> : <Edit />}
						</IconButton>
					</InputAdornment>
				) : null,
			}}
		/>
	)
}
