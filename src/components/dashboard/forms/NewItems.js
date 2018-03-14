import React from 'react'
import NewItemSteps from './items/NewItemSteps'
import NewItemWithDialog from './items/NewItemWithDialog'
import NewSlotForm from './items/NewSlotForm'
import NewSlotFormImgs from './items/NewSlotFormImgs'
import NewUnitFormBasic from './items/NewUnitFormBasic'
import NewUnitFormImg from './items/NewUnitFormImg'
import NewUnitFormTargets from './items/NewUnitFormTargets'
import NewCampaignForm from './items/NewCampaignForm'
import { AdUnit, AdSlot, Channel, Campaign } from 'adex-models'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes } = ItemsConstants

const NewItemStepsWithDialog = NewItemWithDialog(NewItemSteps)

export const NewUnit = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel='NEW_UNIT'
        title='CREATE_NEW_UNIT'
        itemType={ItemsTypes.AdUnit.id}
        itemPages={[NewUnitFormBasic, NewUnitFormImg, NewUnitFormTargets]}
        imgLabel='UNIT_BANNER_IMG_LABEL'
        noDefaultImg
        itemModel={AdUnit}
    />

export const NewCampaign = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel='NEW_CAMPAIGN'
        title='CREATE_NEW_CAMPAIGN'
        itemType={ItemsTypes.Campaign.id}
        itemPages={[NewCampaignForm]}
        imgLabel='CAMPAIGN_LOGO'
        itemModel={Campaign}
        imgAdditionalInfo='CAMPAIGN_IMG_ADDITIONAL_INFO'
    />

export const NewSlot = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel='NEW_SLOT'
        title='CREATE_NEW_SLOT'
        itemType={ItemsTypes.AdSlot.id}
        itemPages={[NewSlotForm, NewSlotFormImgs]}
        imgLabel='SLOT_AVATAR_IMG_LABEL'
        noDefaultImg
        descriptionHelperTxt='SLOT_DESCRIPTION_HELPER'
        itemModel={AdSlot}
    />

export const NewChannel = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel='NEW_CHANNEL'
        title='CREATE_NEW_CHANNEL'
        itemType={ItemsTypes.Channel.id}
        itemPages={[]}
        imgLabel='CHANNEL_LOGO'
        itemModel={Channel}
        imgAdditionalInfo='CHANNEL_IMG_ADDITIONAL_INFO'
    />
