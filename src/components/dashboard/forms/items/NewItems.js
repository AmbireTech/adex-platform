import React from 'react'
import Button from '@material-ui/core/Button'
import FormSteps from 'components/dashboard/forms/FormSteps'
import NewItemHoc from './NewItemHocStep'
import NewItemFormPreview from './NewItemFormPreview'
import WithDialog from 'components/common/dialog/WithDialog'
import NewItemForm from './NewItemForm'
import NewSlotForm from './NewSlotForm'
import NewSlotFormImgs from './NewSlotFormImgs'
import NewUnitFormTargets from './NewUnitFormTargets'
import NewUnitFormType from './NewUnitFormType'
import NewUnitFormImg from './NewUnitFormImg'
import NewCampaignForm from './NewCampaignForm'
import { AdUnit, AdSlot, Channel, Campaign } from 'adex-models'
import { items as ItemsConstants } from 'adex-constants'
import AddIcon from '@material-ui/icons/Add'
import SaveIcon from '@material-ui/icons/Save'

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

const SaveBtnWithItem = NewItemHoc(SaveBtn)

const CancelBtn = ({ ...props }) => {
    return (
        <Button onClick={props.cancel} >
            {props.t('CANCEL')}
        </Button>
    )
}

const CancelBtnWithItem = NewItemHoc(CancelBtn)

const itemsCommon = {
    SaveBtn: SaveBtnWithItem,
    CancelBtn: CancelBtnWithItem,
    stepsPreviewPage: { title: 'PREVIEW_AND_SAVE_ITEM', page: NewItemFormPreview },
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
        {...itemsCommon}
        itemType={ItemsTypes.AdUnit.id}
        stepsId={ItemsTypes.AdUnit.id}
        stepsPages={[
            // TODO SIMO: Uncomment
            // { title: 'UNIT_BASIC_STEP', page: NewItemForm },
            // { title: 'UNIT_TYPE_DATA_STEP', page: NewUnitFormType },
            // { title: 'UNIT_BANNER_STEP', page: NewUnitFormImg },
            { title: 'UNIT_TARGETS_STEP', page: NewUnitFormTargets }
        ]}
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
        {...itemsCommon}
        itemType={ItemsTypes.Campaign.id}
        stepsId={ItemsTypes.Campaign.id}
        stepsPages={[
            { title: 'CAMPAIGN_BASIC_STEP', page: NewItemForm },
            { title: 'CAMPAIGN_PERIOD_STEP', page: NewCampaignForm }
        ]}
        imgLabel='CAMPAIGN_LOGO'
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
            { title: 'SLOT_IMAGES_STEP', page: NewSlotFormImgs }
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

// Channel
export const NewChannelSteps = (props) =>
    <FormSteps
        {...props}
        {...itemsCommon}
        itemType={ItemsTypes.Channel.id}
        stepsId={ItemsTypes.Channel.id}
        stepsPages={[
            { title: 'CHANNEL_BASIC_STEP', page: NewItemForm },
        ]}
        imgLabel='CHANNEL_LOGO'
        itemModel={Channel}
        imgAdditionalInfo='CHANNEL_IMG_ADDITIONAL_INFO'
    />

const NewChannelStepsWithDialog = WithDialog(NewChannelSteps)

export const NewChannelDialog = (props) =>
    <NewChannelStepsWithDialog
        {...props}
        {...dialogCommon}
        btnLabel='NEW_CHANNEL'
        title='CREATE_NEW_CHANNEL'
    />