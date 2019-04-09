import React from 'react'
import Button from '@material-ui/core/Button'
import FormSteps from 'components/dashboard/forms/FormSteps'
import NewItemHoc from './NewItemHocStep'
// import NewItemFormPreview from './NewItemFormPreview'
import WithDialog from 'components/common/dialog/WithDialog'
import NewItemForm from './NewItemForm'
import NewSlotForm from './NewSlotForm'
import NewSlotFormImgs from './NewSlotFormImgs'
import NewUnitFormTargets from './NewUnitFormTargets'
import NewUnitFormType from './NewUnitFormType'
import NewUnitFormImg from './NewUnitFormImg'
import NewItemFormTags from './NewItemFormTags';
import NewCampaignForm from './NewCampaignForm'
import { AdUnit, AdSlot, Campaign } from 'adex-models'
import { items as ItemsConstants } from 'adex-constants'
import AddIcon from '@material-ui/icons/Add'
import SaveIcon from '@material-ui/icons/Save'

import NewAdUnitHoc from './AdUnit/NewAdUnitHoc'
import AdUnitBasic from './AdUnit/AdUnitBasic'
import AdUnitMedia from './AdUnit/AdUnitMedia'
import AdUnitTargeting from './AdUnit/AdUnitTargeting'
import AdUnitFormPreview from './AdUnit/AdUnitFormPreview'

import NewCampaignHoc from './Campaign/NewCampaignHoc'
import CampaignUnits from './Campaign/CampaignUnits'
import CampaignTargeting from './Campaign/CampaignTargeting'
import CampaignFormPreview from './Campaign/CampaignFormPreview'

const { ItemsTypes } = ItemsConstants
const SaveBtn = ({ ...props }) => {
	return (
		<Button
			color='primary'
			onClick={props.save}
		>
			{/*TODO: withStyles */}
			<SaveIcon style={{ marginRight: 8 }} />
			{props.t('SAVE')}
		</Button>
	)
}

const SaveBtnWithAdUnit = NewAdUnitHoc(SaveBtn)
const SaveBtnWithCampaign = NewCampaignHoc(SaveBtn)

const CancelBtn = ({ ...props }) => {
	return (
		<Button onClick={props.cancel} >
			{props.t('CANCEL')}
		</Button>
	)
}

const CancelBtnWithItem = NewAdUnitHoc(CancelBtn)
const CancelBtnWithCampaign = NewCampaignHoc(CancelBtn)

const itemsCommon = {
	SaveBtn: SaveBtnWithAdUnit,
	CancelBtn: CancelBtnWithItem,
	stepsPreviewPage: { title: 'PREVIEW_AND_SAVE_ITEM', page: AdUnitFormPreview },
	validateIdBase: 'new-'
}

const dialogCommon = {
	darkerBackground: true,
	icon: <AddIcon />
}

// Ad unit
export const NewUnitSteps = (props) =>
	<FormSteps
		{...props}
		SaveBtn={SaveBtnWithAdUnit}
		CancelBtn={CancelBtnWithItem}
		validateIdBase={'new-AdUnit-'}
		itemType={'AdUnit'}
		stepsId={'new-adunit-'}
		stepsPages={[
			{ title: 'UNIT_BASIC_STEP', page: AdUnitBasic },
			{ title: 'UNIT_MEDIA_STEP', page: AdUnitMedia },
			{ title: 'UNIT_TARGETS_STEP', page: AdUnitTargeting }
		]}
		stepsPreviewPage={{ title: 'PREVIEW_AND_SAVE_ITEM', page: AdUnitFormPreview }}
		imgLabel='UNIT_BANNER_IMG_LABEL'
		noDefaultImg
		itemModel={AdUnit}
	/>

const NewUnitStepsWithDialog = WithDialog(NewUnitSteps)

export const NewUnitDialog = (props) =>
	<NewUnitStepsWithDialog
		{...props}
		{...dialogCommon}
		btnLabel='NEW_UNIT'
		title='CREATE_NEW_UNIT'
	/>

// Campaign
export const NewCampaignSteps = (props) =>
	<FormSteps
		{...props}
		SaveBtn={SaveBtnWithCampaign}
		CancelBtn={CancelBtnWithCampaign}
		validateIdBase={'new-Campaign-'}
		itemType={'Campaign'}
		stepsId={'new-campaign-'}
		stepsPages={[
			{ title: 'CAMPAIGN_UNITS_STEP', page: CampaignUnits },
			{ title: 'CAMPAIGN_TARGETING_STEP', page: CampaignTargeting }
		]}
		stepsPreviewPage={{ title: 'PREVIEW_AND_SAVE_ITEM', page: CampaignFormPreview }}
		itemModel={Campaign}
		imgAdditionalInfo='CAMPAIGN_IMG_ADDITIONAL_INFO'
	/>

const NewCampaignStepsWithDialog = WithDialog(NewCampaignSteps)

export const NewCampaignDialog = (props) =>
	<NewCampaignStepsWithDialog
		{...props}
		{...dialogCommon}
		btnLabel='NEW_CAMPAIGN'
		title='CREATE_NEW_CAMPAIGN'
	/>

// Ad slot
export const NewSlotSteps = (props) =>
	<FormSteps
		{...props}
		{...itemsCommon}
		itemType={ItemsTypes.AdSlot.id}
		stepsId={ItemsTypes.AdSlot.id}
		stepsPages={[
			{ title: 'SLOT_BASIC_STEP', page: NewItemForm },
			{ title: 'SLOT_TYPE_DATA_STEP', page: NewSlotForm },
			{ title: 'SLOT_IMAGES_STEP', page: NewSlotFormImgs },
			{ title: 'SLOT_TAGS_STEP', page: NewItemFormTags }
		]}
		imgLabel='SLOT_AVATAR_IMG_LABEL'
		imgAdditionalInfo='SLOT_AVATAR_IMG_INFO'
		descriptionHelperTxt='SLOT_DESCRIPTION_HELPER'
		itemModel={AdSlot}
	/>

const NewSlotStepsWithDialog = WithDialog(NewSlotSteps)

export const NewSlotDialog = (props) =>
	<NewSlotStepsWithDialog
		{...props}
		{...dialogCommon}
		btnLabel='NEW_SLOT'
		title='CREATE_NEW_SLOT'
	/>