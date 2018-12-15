import React from 'react'
import Button from '@material-ui/core/Button'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import FormSteps from 'components/dashboard/forms/FormSteps'
import BidForm from './BidForm'
import BidFormPreview from './BidFormPreview'
import NewBidHoc from './NewBidHoc'

const SaveBtn = ({ ...props }) => {
    return (
        <Button
            icon={props.waitingForWalletAction ? 'hourglass_empty' : (props.saveBtnIcon || '')}
            color='primary'
            onClick={props.save}
            disabled={props.waitingForWalletAction}
        >
            {props.waitingForWalletAction ?
                <HourglassEmptyIcon style={{ marginRight: 8 }} />
                : props.saveBtnIcon || null
            }

            {props.t(props.saveBtnLabel || 'PLACE_BID_SAVE_BTN')}
        </Button>
    )
}

const CancelBtn = ({ ...props }) => {
    return (
        <Button
            onClick={props.cancel}
        >
            {props.t(props.cancelBtnLabel || 'CANCEL')}
        </Button>
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