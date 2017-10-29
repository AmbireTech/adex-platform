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
        btnLabel="New Unit"
        title="Create new unit"
        itemType={ItemsTypes.AdUnit.id}
        itemPages={[NewUnitFormBasic]}
        imgLabel="ADUNIT_BANNER"
        noDefaultImg
    />

export const NewCampaign = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="New Campaign"
        title="Create new Campaign"
        itemType={ItemsTypes.Campaign.id}
        itemPages={[NewCampaignForm]}
        imgLabel="CAMPAIGN_LOGO"
    />

export const NewSlot = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="New Slot"
        title="Create new slot"
        itemType={ItemsTypes.AdSlot.id}
        itemPages={[NewSlotForm]}
        imgLabel="SLOT_LOGO"
        noDefaultImg        
    />

export const NewChannel = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="New Channel"
        title="Create new Channel"
        itemType={ItemsTypes.Channel.id}
        itemPages={[]}
        imgLabel="CHANNEL_LOGO"
    />
