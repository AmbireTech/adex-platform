import React from 'react'
import FormSteps from 'components/common/stepper/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
import { AdUnit, AdSlot, Campaign } from 'adex-models'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import AdUnitBasic from './AdUnit/AdUnitBasic'
import AdUnitMedia from './AdUnit/AdUnitMedia'
import AdUnitFormPreview from './AdUnit/AdUnitFormPreview'
import CampaignUnits from './Campaign/CampaignUnits'
import CampaignFinance from './Campaign/CampaignFinance'
import CampaignFormPreview from './Campaign/CampaignFormPreview'
import AdSlotBasic from './AdSlot/AdSlotBasic'
import AdSlotMedia from './AdSlot/AdSlotMedia'
import NewItemTargeting from './NewItemTargeting'
import AdSlotPreview from './AdSlot/AdSlotPreview'

import {
	execute,
	validateNewUnitBasics,
	validateNewCampaignFinance,
	validateNewCampaignAdUnits,
	validateNewSlotBasics,
	validateNewSlotPassback,
	validateNewUnitMedia,
	completeItem,
	resetNewItem,
	saveUnit,
	saveSlot,
	openCampaign,
} from 'actions'

import { slotSources, unitSources } from 'selectors'

const AdSlotTargeting = props => (
	<NewItemTargeting
		{...props}
		itemType='AdSlot'
		sourcesSelector={slotSources}
	/>
)

const AdUnitTargeting = props => (
	<NewItemTargeting
		{...props}
		itemType='AdUnit'
		sourcesSelector={unitSources}
	/>
)

// Ad unit
export const NewUnitSteps = props => (
	<FormSteps
		{...props}
		cancelFunction={() => execute(resetNewItem('AdUnit'))}
		validateIdBase={'new-AdUnit-'}
		itemType={'AdUnit'}
		stepsId={'new-adunit-'}
		steps={[
			{
				title: 'UNIT_BASIC_STEP',
				component: AdUnitBasic,
				validationFn: props => execute(validateNewUnitBasics(props)),
			},
			{
				title: 'UNIT_MEDIA_STEP',
				component: AdUnitMedia,
				validationFn: props => execute(validateNewUnitMedia(props)),
			},
			{ title: 'UNIT_TARGETS_STEP', component: AdUnitTargeting },
			{
				title: 'PREVIEW_AND_SAVE_ITEM',
				component: AdUnitFormPreview,
				completeFn: props =>
					execute(
						completeItem({
							...props,
							competeAction: saveUnit,
						})
					),
			},
		]}
		imgLabel='UNIT_BANNER_IMG_LABEL'
		noDefaultImg
		itemModel={AdUnit}
	/>
)

const NewUnitStepsWithDialog = WithDialog(NewUnitSteps)

export const NewUnitDialog = props => (
	<NewUnitStepsWithDialog
		{...props}
		btnLabel='NEW_UNIT'
		title='CREATE_NEW_UNIT'
	/>
)

const copyProps = {
	darkerBackground: true,
	icon: <FileCopyIcon color='primary' />,
}

export const NewCloneUnitDialog = props => (
	<NewUnitStepsWithDialog {...props} {...copyProps} title='CLONE_AD_UNIT' />
)

// Campaign
export const NewCampaignSteps = props => (
	<FormSteps
		{...props}
		cancelFunction={() => execute(resetNewItem('Campaign'))}
		validateIdBase={'new-Campaign-'}
		itemType={'Campaign'}
		stepsId={'new-campaign-'}
		steps={[
			{
				title: 'CAMPAIGN_UNITS_STEP',
				component: CampaignUnits,
				validationFn: props => execute(validateNewCampaignAdUnits(props)),
			},
			{
				title: 'CAMPAIGN_FINANCE_STEP',
				component: CampaignFinance,
				validationFn: ({ validateId, dirty, onValid, onInvalid }) =>
					execute(
						validateNewCampaignFinance({
							validateId,
							dirty,
							onValid,
							onInvalid,
						})
					),
			},
			{
				title: 'PREVIEW_AND_SAVE_ITEM',
				component: CampaignFormPreview,
				completeFn: props =>
					execute(
						completeItem({
							...props,
							competeAction: openCampaign,
						})
					),
			},
		]}
		itemModel={Campaign}
		imgAdditionalInfo='CAMPAIGN_IMG_ADDITIONAL_INFO'
	/>
)

const NewCampaignStepsWithDialog = WithDialog(NewCampaignSteps)

export const NewCampaignDialog = props => (
	<NewCampaignStepsWithDialog
		{...props}
		btnLabel='NEW_CAMPAIGN'
		title='CREATE_NEW_CAMPAIGN'
	/>
)

// Ad slot
export const NewSlotSteps = props => (
	<FormSteps
		{...props}
		cancelFunction={() => execute(resetNewItem('AdSlot'))}
		validateIdBase={'new-AdUnit-'}
		itemType={'AdSlot'}
		stepsId={'new-slot-'}
		steps={[
			{
				title: 'SLOT_BASIC_STEP',
				component: AdSlotBasic,
				validationFn: ({ validateId, dirty, onValid, onInvalid }) =>
					execute(
						validateNewSlotBasics({
							validateId,
							dirty,
							onValid,
							onInvalid,
						})
					),
			},
			{
				title: 'SLOT_PASSBACK_STEP',
				component: AdSlotMedia,
				validationFn: props => execute(validateNewSlotPassback(props)),
			},
			{ title: 'SLOT_TAGS_STEP', component: AdSlotTargeting },
			{
				title: 'PREVIEW_AND_SAVE_ITEM',
				component: AdSlotPreview,
				completeFn: props =>
					execute(
						completeItem({
							...props,
							competeAction: saveSlot,
						})
					),
			},
		]}
		imgLabel='SLOT_AVATAR_IMG_LABEL'
		imgAdditionalInfo='SLOT_AVATAR_IMG_INFO'
		descriptionHelperTxt='SLOT_DESCRIPTION_HELPER'
		itemModel={AdSlot}
	/>
)

const NewSlotStepsWithDialog = WithDialog(NewSlotSteps)

export const NewSlotDialog = props => (
	<NewSlotStepsWithDialog
		{...props}
		btnLabel='NEW_SLOT'
		title='CREATE_NEW_SLOT'
	/>
)
