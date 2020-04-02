import React from 'react'
import Button from '@material-ui/core/Button'
import FormSteps from 'components/common/stepper/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
import { AdUnit, AdSlot, Campaign } from 'adex-models'
import FileCopyIcon from '@material-ui/icons/FileCopy'
import AddIcon from '@material-ui/icons/Add'
import SaveIcon from '@material-ui/icons/Save'
import NewAdUnitHoc from './AdUnit/NewAdUnitHoc'
import AdUnitBasic from './AdUnit/AdUnitBasic'
import AdUnitMedia from './AdUnit/AdUnitMedia'
import AdUnitFormPreview from './AdUnit/AdUnitFormPreview'
import NewCampaignHoc from './Campaign/NewCampaignHoc'
import CampaignUnits from './Campaign/CampaignUnits'
// import CampaignTargeting from './Campaign/CampaignTargeting'
import CampaignFinance from './Campaign/CampaignFinance'
import CampaignFormPreview from './Campaign/CampaignFormPreview'
import NewAdSlotHoc from './AdSlot/NewAdSlotHoc'
import AdSlotBasic from './AdSlot/AdSlotBasic'
import AdSlotMedia from './AdSlot/AdSlotMedia'
import NewItemTargeting from './NewItemTargeting'
import AdSlotPreview from './AdSlot/AdSlotPreview'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'

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
	addSlot,
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

const SaveBtn = ({ newItem, t, save, ...rest }) => {
	return (
		<Button color='primary' onClick={save}>
			{/*TODO: withStyles */}
			<SaveIcon style={{ marginRight: 8 }} />
			{t('SAVE')}
		</Button>
	)
}

const SendBtn = ({ saveBtnLabel, saveBtnIcon, newItem, t, save, ...rest }) => {
	return (
		<Button
			color='primary'
			onClick={save}
			disabled={newItem.temp.waitingAction}
		>
			{newItem.temp.waitingAction ? (
				<HourglassEmptyIcon />
			) : (
				saveBtnIcon || <SaveIcon style={{ marginRight: 8 }} />
			)}
			{t(saveBtnLabel || 'OPEN_CAMPAIGN')}
		</Button>
	)
}

const SaveBtnWithAdUnit = NewAdUnitHoc(SaveBtn)
const SaveBtnWithCampaign = NewCampaignHoc(SendBtn)
const SaveBtnWithAdSlot = NewAdSlotHoc(SaveBtn)

const CancelBtn = ({ ...props }) => {
	return <Button onClick={props.cancel}>{props.t('CANCEL')}</Button>
}

const CancelBtnWithItem = NewAdUnitHoc(CancelBtn)
const CancelBtnWithCampaign = NewCampaignHoc(CancelBtn)
const CancelBtnWithAdSlot = NewAdSlotHoc(CancelBtn)

const dialogCommon = {
	darkerBackground: true,
	icon: <AddIcon />,
}

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
							competeAction: addSlot,
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
		{...dialogCommon}
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
			// NOTE: Only at ad units at the moment
			// { title: 'CAMPAIGN_TARGETING_STEP', page: CampaignTargeting },
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
				page: CampaignFormPreview,
				final: true,
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
		{...dialogCommon}
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
							competeAction: addSlot,
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
		{...dialogCommon}
		btnLabel='NEW_SLOT'
		title='CREATE_NEW_SLOT'
	/>
)
