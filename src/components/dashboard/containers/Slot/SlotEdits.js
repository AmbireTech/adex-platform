import React from 'react'
import {
	InputAdornment,
	IconButton,
	TextField,
	Box,
	FormControl,
	FormControlLabel,
	FormGroup,
	Checkbox,
	Grid,
} from '@material-ui/core'
import { Edit, UndoOutlined } from '@material-ui/icons'
import WithDialog from 'components/common/dialog/WithDialog'
import FormSteps from 'components/common/stepper/FormSteps'
import AdSlotMedia from 'components/dashboard/forms/items/AdSlot/AdSlotMedia'
import OutlinedPropView from 'components/common/OutlinedPropView'
import { formatTokenAmount } from 'helpers/formatters'
import { BigNumber } from 'ethers'

import {
	execute,
	resetNewItem,
	updateSlotPasback,
	mapCurrentToNewPassback,
	validateNumberString,
} from 'actions'
import { t, selectMainToken } from 'selectors'

import { AdSlot } from 'adex-models'

export const PassbackSteps = ({ updateMultipleFields, itemId, ...props }) => {
	return (
		<FormSteps
			{...props}
			cancelFunction={() => execute(resetNewItem('AdSlot', itemId))}
			itemId={itemId}
			validateIdBase='new-AdUnit-'
			itemType='AdSlot'
			stepsId='new-slot-'
			steps={[
				{
					title: 'SLOT_PASSBACK_STEP',
					component: AdSlotMedia,
					completeBtnTitle: 'OK',
					completeFn: props =>
						execute(
							updateSlotPasback({ updateMultipleFields, itemId, ...props })
						),
				},
			]}
			itemModel={AdSlot}
		/>
	)
}

const PassbackEdit = WithDialog(PassbackSteps)

export const SlotAdvancedRules = ({
	item = {},
	updateMultipleFields,
	validations,
	validateId,
	updateField,
	setActiveFields,
	returnPropToInitialState,
	activeFields = {},
}) => {
	const { address, decimals, symbol } = selectMainToken()
	const { minPerImpression, rulesInput: slotRulesInput } = item
	const rulesInput = slotRulesInput || { version: '1', inputs: {} }
	const { autoSetMinCPM, allowAdultContent } = rulesInput.inputs
	const active = !!activeFields.minPerImpression
	const { minPerImpression: errMin } = validations
	const showError = !!errMin && errMin.dirty
	const minCPM =
		typeof minPerImpression === 'object'
			? formatTokenAmount(
					BigNumber.from((item.minPerImpression || {})[address] || '0').mul(
						1000
					),
					decimals,
					true
			  )
			: minPerImpression

	return (
		<Grid container spacing={2}>
			<Grid item xs={12}>
				<TextField
					fullWidth
					variant='outlined'
					type='text'
					required
					label={t('MIN_CPM_SLOT_LABEL_MANUAL', { args: [symbol] })}
					name='minPerImpression'
					value={minCPM || ''}
					disabled={!!autoSetMinCPM || !active}
					onChange={ev => {
						const value = ev.target.value
						updateField('minPerImpression', value, {
							name: 'slotAdvanced',
							fields: ['rulesInput', 'minPerImpression'],
						})
						execute(
							validateNumberString({
								validateId,
								prop: 'minPerImpression',
								value,
								dirty: true,
							})
						)
					}}
					error={showError}
					maxLength={120}
					helperText={
						showError ? errMin.errMsg : t('SLOT_MANUAL_CPM_MIN_HELPER')
					}
					InputProps={
						!autoSetMinCPM
							? {
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
							  }
							: {}
					}
				/>
			</Grid>

			<Grid item xs={12}>
				<OutlinedPropView
					label={t('SLOT_AUTO_MIN_CPM_LABEL')}
					value={
						<FormControl>
							<FormGroup row>
								<FormControlLabel
									control={
										<Checkbox
											checked={!!autoSetMinCPM}
											onChange={ev => {
												const checked = ev.target.checked
												updateField(
													'rulesInput',
													{
														...rulesInput,
														inputs: {
															...rulesInput.inputs,
															autoSetMinCPM: checked,
														},
													},
													{
														name: 'slotAdvanced',
														fields: ['rulesInput', 'minPerImpression'],
													}
												)
											}}
											value='autoSetMinCPM'
										/>
									}
									label={t('SLOT_AUTO_MIN_CPM_INFO_LABEL')}
								/>
							</FormGroup>
						</FormControl>
					}
				/>
			</Grid>
			<Grid item xs={12}>
				<OutlinedPropView
					label={t('SLOT_ALLOW_ADULT_CONTENT')}
					value={
						<FormControl>
							<FormGroup row>
								<FormControlLabel
									control={
										<Checkbox
											checked={!!allowAdultContent}
											onChange={ev =>
												updateField(
													'rulesInput',
													{
														...rulesInput,
														inputs: {
															...rulesInput.inputs,
															allowAdultContent: ev.target.checked,
														},
													},
													{
														name: 'slotAdvanced',
														fields: ['rulesInput', 'minPerImpression'],
													}
												)
											}
											value='allowAdultContent'
										/>
									}
									label={t('SLOT_ALLOW_ADULT_CONTENT_INFO')}
								/>
							</FormGroup>
						</FormControl>
					}
				/>
			</Grid>
		</Grid>
	)
}

export const SlotEdits = ({ item, ...hookProps }) => {
	return (
		<Box display='flex' flexDirection='row' flexWrap='wrap'>
			<PassbackEdit
				fullWidth
				size='large'
				variant='contained'
				color='secondary'
				btnLabel='UPDATE_PASSBACK'
				title='UPDATE_SLOT_PASSBACK'
				itemId={item.id}
				disableBackdropClick
				updateMultipleFields={hookProps.updateMultipleFields}
				onClick={() =>
					execute(
						mapCurrentToNewPassback({
							itemId: item.id,
							dirtyProps: hookProps.dirtyProps,
						})
					)
				}
			/>
		</Box>
	)
}
