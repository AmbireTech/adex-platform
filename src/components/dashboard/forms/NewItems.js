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
        btnLabel="NEW_UNIT"
        title="CREATE_NEW_UNIT"
        itemType={ItemsTypes.AdUnit.id}
        itemPages={[NewUnitFormBasic]}
        imgLabel="UNIT_BANNER"
        noDefaultImg
    />

export const NewCampaign = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="NEW_CAMPAIGN"
        title="CREATE_NEW_CAMPAIGN"
        itemType={ItemsTypes.Campaign.id}
        itemPages={[NewCampaignForm]}
        imgLabel="CAMPAIGN_LOGO"
    />

export const NewSlot = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="NEW_SLOT"
        title="CREATE_NEW_SLOT"
        itemType={ItemsTypes.AdSlot.id}
        itemPages={[NewSlotForm]}
        imgLabel="SLOT_PREVIEW"
        noDefaultImg
        descriptionHelperTxt="SLOT_DESCRIPTION_HELPER"    
    />

export const NewChannel = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="NEW_CHANNEL"
        title="CREATE_NEW_CHANNEL"
        itemType={ItemsTypes.Channel.id}
        itemPages={[NewChannelForm]}
        imgLabel="CHANNEL_LOGO"
    />
