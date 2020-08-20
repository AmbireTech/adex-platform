import React from 'react'
import FormSteps from 'components/common/stepper/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
import { AdUnit, AdSlot, Campaign, Audience } from 'adex-models'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import AdUnitBasic from './AdUnit/AdUnitBasic'
import AdUnitMedia from './AdUnit/AdUnitMedia'
import AdUnitFormPreview from './AdUnit/AdUnitFormPreview'
import CampaignUnits from './Campaign/CampaignUnits'
import CampaignFinance from './Campaign/CampaignFinance'
import CampaignFormPreview from './Campaign/CampaignFormPreview'
import AdSlotBasic from './AdSlot/AdSlotBasic'
import AdSlotMedia from './AdSlot/AdSlotMedia'
import AudienceBasic from './Audience/AudienceBasic'
import NewAudiencePreview from './Audience/NewAudiencePreview'
import NewTargetingRules from './NewTargetingRules'
import AdSlotPreview from './AdSlot/AdSlotPreview'
import WebsiteBasic from './Website/WebsiteBasic'
import WebsitePreview from './Website/WebsitePreview'

import {
	execute,
	validateNewUnitBasics,
	validateNewCampaignFinance,
	validateNewCampaignAdUnits,
	validateNewSlotBasics,
	validateNewSlotPassback,
	validateNewUnitMedia,
	validateCampaignAudienceInput,
	validateAudienceBasics,
	validateAudienceInput,
	validateAndSaveNewWebsiteBasics,
	completeItem,
	resetNewItem,
	saveUnit,
	saveSlot,
	saveAudience,
	openCampaign,
} from 'actions'

export const CampaignTargetingRules = props => (
	<NewTargetingRules {...props} itemType='Campaign' />
)

export const AudienceRules = props => (
	<NewTargetingRules {...props} itemType='Audience' />
)

// Ad unit
export const NewUnitSteps = props => (
	<FormSteps
		{...props}
		cancelFunction={() => execute(resetNewItem('AdUnit'))}
		validateIdBase='new-AdUnit-'
		itemType='AdUnit'
		stepsId='new-adunit-'
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
			{
				title: 'PREVIEW_AND_SAVE_ITEM',
				completeBtnTitle: 'SAVE',
				component: AdUnitFormPreview,
				completeFn: props =>
					execute(
						completeItem({
							...props,
							itemType: 'AdUnit',
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
		validateIdBase='new-Campaign-'
		itemType='Campaign'
		stepsId='new-campaign-'
		steps={[
			{
				title: 'CAMPAIGN_UNITS_STEP',
				component: CampaignUnits,
				validationFn: props => execute(validateNewCampaignAdUnits(props)),
			},
			{
				title: 'CAMPAIGN_AUDIENCE_STEP',
				component: CampaignTargetingRules,
				validationFn: props => execute(validateCampaignAudienceInput(props)),
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
				completeBtnTitle: 'OPEN_CAMPAIGN',
				component: CampaignFormPreview,
				completeFn: props =>
					execute(
						completeItem({
							...props,
							itemType: 'Campaign',
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
		btnLabel='NEW_CAMPAIGN'
		title='CREATE_NEW_CAMPAIGN'
		{...props}
	/>
)

export const NewCampaignFromAudience = props => (
	<NewCampaignStepsWithDialog {...props} title='NEW_CAMPAIGN_FROM_AUDIENCE' />
)

// Ad slot
export const NewSlotSteps = props => (
	<FormSteps
		{...props}
		cancelFunction={() => execute(resetNewItem('AdSlot'))}
		validateIdBase='new-AdUnit-'
		itemType='AdSlot'
		stepsId='new-slot-'
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
			{
				title: 'PREVIEW_AND_SAVE_ITEM',
				completeBtnTitle: 'SAVE',
				component: AdSlotPreview,
				completeFn: props =>
					execute(
						completeItem({
							...props,
							itemType: 'AdSlot',
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

// Audience

export const AudienceSteps = props => (
	<FormSteps
		{...props}
		cancelFunction={() => execute(resetNewItem('Audience'))}
		validateIdBase='new-Audience-'
		itemType='Audience'
		stepsId='new-audience-'
		steps={[
			{
				title: 'AUDIENCE_BASIC_STEP',
				component: AudienceBasic,
				validationFn: ({ validateId, dirty, onValid, onInvalid }) =>
					execute(
						validateAudienceBasics({
							validateId,
							dirty,
							onValid,
							onInvalid,
						})
					),
			},
			...(props.skipRules
				? []
				: [
						{
							title: 'AUDIENCE_STEP',
							component: AudienceRules,
							validationFn: ({ validateId, dirty, onValid, onInvalid }) =>
								execute(
									validateAudienceInput({
										validateId,
										dirty,
										onValid,
										onInvalid,
									})
								),
						},
				  ]),
			{
				title: 'PREVIEW_AND_SAVE_ITEM',
				completeBtnTitle: 'SAVE',
				component: NewAudiencePreview,
				completeFn: props =>
					execute(
						completeItem({
							...props,
							itemType: 'Audience',
							competeAction: saveAudience,
						})
					),
			},
		]}
		itemModel={Audience}
	/>
)

export const NewAudienceWithDialog = WithDialog(AudienceSteps)

export const NewAudienceDialog = props => (
	<NewAudienceWithDialog
		btnLabel='NEW_AUDIENCE'
		title='CREATE_NEW_AUDIENCE'
		{...props}
	/>
)

// Website

export const WebsiteSteps = props => (
	<FormSteps
		{...props}
		cancelFunction={() => execute(resetNewItem('Website'))}
		validateIdBase='new-Website-'
		itemType='Website'
		stepsId='new-website-'
		steps={[
			{
				title: 'WEBSITE_BASIC_STEP',
				nextBtnTitle: 'SAVE',
				component: WebsiteBasic,
				validationFn: ({ validateId, dirty, onValid, onInvalid }) =>
					execute(
						validateAndSaveNewWebsiteBasics({
							validateId,
							dirty,
							onValid,
							onInvalid,
						})
					),
			},
			{
				title: 'PREVIEW_AND_SAVE_ITEM',
				completeBtnTitle: 'OK',
				component: WebsitePreview,
				completeFn: props =>
					execute(
						completeItem({
							...props,
							itemType: 'Website',
							// Just to close the dialog
							competeAction: () => {},
						})
					),
			},
		]}
		itemModel={Audience}
	/>
)

export const NewWebsiteWithDialog = WithDialog(WebsiteSteps)

export const NewWebsiteDialog = props => (
	<NewWebsiteWithDialog
		btnLabel='NEW_WEBSITE'
		title='CREATE_NEW_WEBSITE'
		{...props}
	/>
)
