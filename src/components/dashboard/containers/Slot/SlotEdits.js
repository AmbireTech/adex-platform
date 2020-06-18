import React from 'react'
import { Box } from '@material-ui/core'
import WithDialog from 'components/common/dialog/WithDialog'
import FormSteps from 'components/common/stepper/FormSteps'
import AdSlotMedia from 'components/dashboard/forms/items/AdSlot/AdSlotMedia'
import {
	execute,
	resetNewItem,
	updateSlotPasback,
	mapCurrentToNewPassback,
} from 'actions'
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
