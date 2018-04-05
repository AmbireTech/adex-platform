import React from 'react'
import { Button } from 'react-toolbox/lib/button'
import FormSteps from 'components/dashboard/forms/FormSteps'
import BidForm from './BidForm'
import BidFormPreview from './BidFormPreview'
import NewBidHoc from './NewBidHoc'

const SaveBtn = ({ ...props }) => {
    return (
        <Button
            icon={props.waitingForWalletAction ? 'hourglass_empty' : (props.saveBtnIcon || '')}
            label={props.t(props.saveBtnLabel || 'PLACE_BID_SAVE_BTN')}
            primary
            onClick={props.save}
            disabled={props.waitingForWalletAction}
        />
    )
}

const CancelBtn = ({ ...props }) => {
    return (
        <Button
            label={props.t(props.cancelBtnLabel || 'CANCEL')}
            onClick={props.cancel}
        />
    )
}

const SaveBtnWithBid = NewBidHoc(SaveBtn)
const CancelBtnWithBid = NewBidHoc(CancelBtn)

const bidsCommon = {
    SaveBtn: SaveBtnWithBid,
    CancelBtn: CancelBtnWithBid,
    stepsPreviewPage: { title: 'PREVIEW_AND_BID', page: BidFormPreview },
    validateIdBase: 'bid-'
}

export const NewBidSteps = (props) =>
    <FormSteps
        {...props}
        {...bidsCommon}
        stepsPages={[{ title: 'BID_DATA_STEP', page: BidForm }]}
    />