import React from 'react'
import { Box } from '@material-ui/core'
import WithDialog from 'components/common/dialog/WithDialog'
import FormSteps from 'components/common/stepper/FormSteps'
import { AdSlotTargeting } from 'components/dashboard/forms/items/NewItems'
import AdSlotMedia from 'components/dashboard/forms/items/AdSlot/AdSlotMedia'
import {
	execute,
	resetNewItem,
	updateSlotTargeting,
	updateSlotPasback,
	mapCurrentToNewTargeting,
	mapCurrentToNewPassback,
} from 'actions'
import { AdSlot } from 'adex-models'

// TODO: Targeting will be changed, but this will be used for campaigns targeting update
export const TargetingSteps = ({ updateField, itemId, ...props }) => {
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
					title: 'SLOT_TAGS_STEP',
					component: AdSlotTargeting,
					completeBtnTitle: 'OK',
					completeFn: props =>
						execute(updateSlotTargeting({ updateField, itemId, ...props })),
				},
			]}
			itemModel={AdSlot}
		/>
	)
}

const TargetEdit = WithDialog(TargetingSteps)

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

export const SlotEdits = ({ item, ...hookProps }) => {
	return (
		<Box display='flex' flexDirection='row' flexWrap='wrap'>
			<TargetEdit
				btnLabel='UPDATE_TAGS'
				title='UPDATE_SLOT_TAGS'
				itemId={item.id}
				disableBackdropClick
				updateField={hookProps.updateField}
				onClick={() =>
					execute(
						mapCurrentToNewTargeting({
							itemId: item.id,
							dirtyProps: hookProps.dirtyProps,
						})
					)
				}
			/>
			<PassbackEdit
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
