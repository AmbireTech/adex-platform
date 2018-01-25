import React from 'react'

import { ItemsTypes } from 'constants/itemsTypes'
import NewItemSteps from './NewItemSteps'
import NewItemWithDialog from './NewItemWithDialog'
// import NewUnitForm from './NewUnitForm'
import NewSlotForm from './NewSlotForm'
import NewUnitFormBasic from './NewUnitFormBasic'
import NewUnitFormTargets from './NewUnitFormTargets'
import NewCampaignForm from './NewCampaignForm'
import NewChannelForm from './NewChannelForm'
import AdUnit from 'models/AdUnit'
import AdSlot from 'models/AdSlot'
import Channel from 'models/Channel'
import Campaign from 'models/Campaign'

const NewItemStepsWithDialog = NewItemWithDialog(NewItemSteps)

export const NewUnit = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="NEW_UNIT"
        title="CREATE_NEW_UNIT"
        itemType={ItemsTypes.AdUnit.id}
        itemPages={[NewUnitFormBasic, NewUnitFormTargets]}
        imgLabel="UNIT_BANNER"
        noDefaultImg
        itemModel={AdUnit}
    />

export const NewCampaign = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="NEW_CAMPAIGN"
        title="CREATE_NEW_CAMPAIGN"
        itemType={ItemsTypes.Campaign.id}
        itemPages={[NewCampaignForm]}
        imgLabel="CAMPAIGN_LOGO"
        itemModel={Campaign}
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
        itemModel={AdSlot}
    />

export const NewChannel = (props) =>
    <NewItemStepsWithDialog
        {...props}
        btnLabel="NEW_CHANNEL"
        title="CREATE_NEW_CHANNEL"
        itemType={ItemsTypes.Channel.id}
        itemPages={[NewChannelForm]}
        imgLabel="CHANNEL_LOGO"
        itemModel={Channel}
    />
