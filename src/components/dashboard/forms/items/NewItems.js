import React from 'react'
import Button from '@material-ui/core/Button'
import FormSteps from 'components/dashboard/forms/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
import { AdUnit, AdSlot, Campaign } from 'adex-models'
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
import CampaignFinance from './Campaign/CampaignFinance'
import CampaignFormPreview from './Campaign/CampaignFormPreview'
import NewAdSlotHoc from './AdSlot/NewAdSlotHoc'
import AdSlotBasic from './AdSlot/AdSlotBasic'
import AdSlotMedia from './AdSlot/AdSlotMedia'
import AdSlotTargeting from './AdSlot/AdSlotTargeting'
import AdSlotPreview from './AdSlot/AdSlotPreview'

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

const SendBtn = ({ ...props }) => {
	return (
		<Button
			color='primary'
			onClick={props.save}
		>
			<SaveIcon style={{ marginRight: 8 }} />
			{props.t('OPEN_CAMPAIGN')}
		</Button>
	)
}

const SaveBtnWithAdUnit = NewAdUnitHoc(SaveBtn)
const SaveBtnWithCampaign = NewCampaignHoc(SendBtn)
const SaveBtnWithAdSlot = NewAdSlotHoc(SendBtn)

const CancelBtn = ({ ...props }) => {
	return (
		<Button onClick={props.cancel} >
			{props.t('CANCEL')}
		</Button>
	)
}

const CancelBtnWithItem = NewAdUnitHoc(CancelBtn)
const CancelBtnWithCampaign = NewCampaignHoc(CancelBtn)
const CancelBtnWithAdSlot = NewAdSlotHoc(CancelBtn)

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
			// NOTE: Only at ad units at the moment
			// { title: 'CAMPAIGN_TARGETING_STEP', page: CampaignTargeting },
			{ title: 'CAMPAIGN_FINANCE_STEP', page: CampaignFinance },
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
		SaveBtn={SaveBtnWithAdSlot}
		CancelBtn={CancelBtnWithAdSlot}
		validateIdBase={'new-AdUnit-'}
		itemType={'AdSlot'}
		stepsId={'new-slot-'}
		stepsPages={[
			{ title: 'SLOT_BASIC_STEP', page: AdSlotBasic },
			{ title: 'SLOT_MEDIA_STEP', page: AdSlotMedia },
			{ title: 'SLOT_TAGS_STEP', page: AdSlotTargeting }
		]}
		stepsPreviewPage={{ title: 'PREVIEW_AND_SAVE_ITEM', page: AdSlotPreview }}
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