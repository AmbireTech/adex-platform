import React from 'react'
import { useSelector } from 'react-redux'
import { Box } from '@material-ui/core'

import WithDialog from 'components/common/dialog/WithDialog'
import FormSteps from 'components/common/stepper/FormSteps'
import { AdSlotTargeting } from 'components/dashboard/forms/items/NewItems'
import AdSlotMedia from 'components/dashboard/forms/items/AdSlot/AdSlotMedia'

import { t, selectNewItemByTypeAndId } from 'selectors'
import {
	execute,
	updateNewItem,
	resetNewItem,
	updateSlotTargeting,
	updateSlotPasback,
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

const getInitialTargeting = (
	{ temp, tags = [] },
	currentTags,
	dirtyProps = []
) => {
	const targets = dirtyProps.includes('tags')
		? currentTags
		: [...tags].map((tag, key) => ({
				key,
				collection: 'tags',
				source: 'custom',
				label: t(`TARGET_LABEL_TAGS`),
				placeholder: t(`TARGET_LABEL_TAGS`),
				target: { ...tag },
		  }))

	const newTemp = { ...temp, targets }

	return { temp: newTemp }
}

const updatePassbackEdit = ({ item, newItem, hookProps }) => {
	const { dirtyProps } = hookProps

	const isDirty = ['mediaUrl', 'mediaMime', 'targetUrl'].some(prop =>
		dirtyProps.includes(prop)
	)

	const { mediaUrl, mediaMime, targetUrl } = item
	const newValues = {}
	if (isDirty) {
		newValues.temp = {
			...newItem.temp,
		}
		newValues.targetUrl = newItem.targetUrl
	} else {
		newValues.temp = {
			...item.temp,
			tempUrl: mediaUrl,
			mime: mediaMime,
			useFallback: !!(mediaUrl || mediaMime || targetUrl),
		}
		newValues.targetUrl = targetUrl
	}

	execute(updateNewItem(item, newValues, 'AdSlot', AdSlot, item.id))
}

export const PassbackSteps = ({ updateField, itemId, ...props }) => {
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
						execute(updateSlotPasback({ updateField, itemId, ...props })),
				},
			]}
			itemModel={AdSlot}
		/>
	)
}

const PassbackEdit = WithDialog(PassbackSteps)

export const SlotEdits = ({ item, ...hookProps }) => {
	const { temp = {} } = useSelector(state =>
		selectNewItemByTypeAndId(state, 'AdSlot', item.id)
	)

	const onTargetingClick = () => {
		execute(
			updateNewItem(
				item,
				getInitialTargeting(item, temp.targets, hookProps.dirtyProps),
				'AdSlot',
				AdSlot,
				item.id
			)
		)
	}

	const onPassbackClick = () =>
		updatePassbackEdit({
			item,
			newItemTemp: temp,
			hookProps,
		})

	return (
		<Box display='flex' flexDirection='row' flexWrap='wrap'>
			<TargetEdit
				btnLabel='UPDATE_TAGS'
				title='UPDATE_SLOT_TAGS'
				itemId={item.id}
				disableBackdropClick
				updateField={hookProps.updateField}
				onClick={onTargetingClick}
			/>

			<PassbackEdit
				btnLabel='UPDATE_PASSBACK'
				title='UPDATE_SLOT_PASSBACK'
				itemId={item.id}
				disableBackdropClick
				updateField={hookProps.updateField}
				onClick={onPassbackClick}
			/>
		</Box>
	)
}
