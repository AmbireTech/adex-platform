import React from 'react'
import NewItemSteps from './items/NewItemSteps'
import NewItemWithDialog from './items/NewItemWithDialog'
import NewItemForm from './items/NewItemForm'
import NewSlotForm from './items/NewSlotForm'
import NewSlotFormImgs from './items/NewSlotFormImgs'
import NewUnitFormType from './items/NewUnitFormType'
import NewUnitFormImg from './items/NewUnitFormImg'
import NewUnitFormTargets from './items/NewUnitFormTargets'
import NewCampaignForm from './items/NewCampaignForm'
import { AdUnit, AdSlot, Channel, Campaign } from 'adex-models'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes } = ItemsConstants

const NewItemStepsWithDialog = NewItemWithDialog(NewItemSteps)

// Ad unit
export const NewUnitSteps = (props) => 
    <NewItemSteps
        {...props}
        itemType={ItemsTypes.AdUnit.id}
        itemPages={[
            {title: 'UNIT_BASIC_STEP', page: NewItemForm},
            {title: 'UNIT_TYPE_DATA_STEP', page: NewUnitFormType},
            {title: 'UNIT_BANNER_STEP', page: NewUnitFormImg},
            {title: 'UNIT_TARGETS_STEP', page: NewUnitFormTargets}
        ]}
        imgLabel='UNIT_BANNER_IMG_LABEL'
        noDefaultImg
        itemModel={AdUnit}
    />

const NewUnitStepsWithDialog = NewItemWithDialog(NewUnitSteps)

export const NewUnitDialog = (props) =>
        <NewUnitStepsWithDialog
            {...props}
            btnLabel='NEW_UNIT'
            title='CREATE_NEW_UNIT'
        />
    
// Campaign
export const NewCampaignSteps = (props) =>
    <NewItemSteps
            {...props}
            itemType={ItemsTypes.Campaign.id}
            itemPages={[
                {title: 'CAMPAIGN_BASIC_STEP', page: NewItemForm},
                {title: 'CAMPAIGN_PERIOD_STEP', page: NewCampaignForm}                
            ]}
            imgLabel='CAMPAIGN_LOGO'
            itemModel={Campaign}
            imgAdditionalInfo='CAMPAIGN_IMG_ADDITIONAL_INFO'
        />

const NewCampaignStepsWithDialog = NewItemWithDialog(NewCampaignSteps)

export const NewCampaignDialog = (props) =>
    <NewCampaignStepsWithDialog
        {...props}
        btnLabel='NEW_CAMPAIGN'
        title='CREATE_NEW_CAMPAIGN'
    />

// Ad slot
export const NewSlotSteps = (props) =>
    <NewItemSteps
        {...props}
        itemType={ItemsTypes.AdSlot.id}
        itemPages={[
            {title: 'SLOT_BASIC_STEP', page: NewItemForm},
            {title: 'SLOT_TYPE_DATA_STEP', page: NewSlotForm},
            {title: 'SLOT_IMAGES_STEP', page: NewSlotFormImgs}
        ]}
        imgLabel='SLOT_AVATAR_IMG_LABEL'
        noDefaultImg
        descriptionHelperTxt='SLOT_DESCRIPTION_HELPER'
        itemModel={AdSlot}
    />


const NewSlotStepsWithDialog = NewItemWithDialog(NewSlotSteps)

export const NewSlotDialog = (props) =>
    <NewSlotStepsWithDialog
        {...props}
        btnLabel='NEW_SLOT'
        title='CREATE_NEW_SLOT'
    />

// Channel
export const NewChannelSteps = (props) =>
    <NewItemStepsWithDialog
        {...props}
        itemType={ItemsTypes.Channel.id}
        itemPages={[
            {title: 'CHANNEL_BASIC_STEP', page: NewItemForm},
        ]}
        imgLabel='CHANNEL_LOGO'
        itemModel={Channel}
        imgAdditionalInfo='CHANNEL_IMG_ADDITIONAL_INFO'
    />

const NewChannelStepsWithDialog = NewItemWithDialog(NewChannelSteps)

export const NewChannelDialog = (props) =>
    <NewChannelStepsWithDialog
        {...props}
        btnLabel='NEW_CHANNEL'
        title='CREATE_NEW_CHANNEL'
    />