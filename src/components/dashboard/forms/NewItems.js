import React from 'react'

import { ItemsTypes } from 'constants/itemsTypes'
import NewItemSteps from './NewItemSteps'
import NewItemWithDialog from './NewItemWithDialog'
// import NewUnitForm from './NewUnitForm'
import NewSlotForm from './NewSlotForm'
import NewUnitFormBasic from './NewUnitFormBasic'
import NewCampaignForm from './NewCampaignForm'
import NewChannelForm from './NewChannelForm'

const NewItemStepsWithDialog = NewItemWithDialog(NewItemSteps)

export const NewUnit = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="LABEL_NEW_UNIT"
        title="LABEL_CREATE_NEW_UNIT"
        itemType={ItemsTypes.AdUnit.id}
        itemPages={[NewUnitFormBasic]}
        imgLabel="UNIT_BANNER"
        noDefaultImg
    />

export const NewCampaign = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="LABEL_NEW_CAMPAIGN"
        title="LABEL_CREATE_NEW_CAMPAIGN"
        itemType={ItemsTypes.Campaign.id}
        itemPages={[NewCampaignForm]}
        imgLabel="CAMPAIGN_LOGO"
    />

export const NewSlot = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="LABEL_NEW_SLOT"
        title="LABEL_CREATE_NEW_SLOT"
        itemType={ItemsTypes.AdSlot.id}
        itemPages={[NewSlotForm]}
        imgLabel="SLOT_LOGO"
        noDefaultImg
        descriptionHelperTxt="SLOT_DESCRIPTION_HELPER"    
    />

export const NewChannel = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="LABEL_NEW_CHANNEL"
        title="LABEL_CREATE_NEW_CHANNEL"
        itemType={ItemsTypes.Channel.id}
        itemPages={[NewChannelForm]}
        imgLabel="CHANNEL_LOGO"
    />
