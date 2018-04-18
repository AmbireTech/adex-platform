import React from 'react'
import ApproveStep from './ApproveStep'
import WithdrawStep from './WithdrawStep'
import DepositToExchange from './DepositToExchange'
import WithdrawFromExchangePage from './WithdrawFromExchange'
import AcceptBidStep from './AcceptBid'
import CancelBidStep from './CancelBid'
import VerifyBidStep from './VerifyBid'
import TransactionPreview from './TransactionPreview'
import scActions from 'services/smart-contracts/actions'
import { sendBidState } from 'services/adex-node/actions'
import { Button } from 'react-toolbox/lib/button'
import TransactionHoc from './TransactionHoc'
import FormSteps from 'components/dashboard/forms/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'

const {
    approveTokens,
    withdrawEth,
    withdrawAdx,
    acceptBid,
    cancelBid,
    verifyBid,
    giveupBid,
    refundBid,
    depositToExchange,
    depositToExchangeEG,
    withdrawFromExchange
} = scActions

const FormStepsWithDialog = WithDialog(FormSteps)

const SaveBtn = ({ save, saveBtnLabel, saveBtnIcon, t, transaction, waitingForWalletAction, spinner, ...other }) => {
    return (
        <Button
            icon={transaction.waitingForWalletAction ? 'hourglass_empty' : (saveBtnIcon || '')}
            label={t(saveBtnLabel || 'DO_IT')}
            primary onClick={save}
            disabled={(transaction.errors && transaction.errors.length) || transaction.waitingForWalletAction || spinner}
        />
    )
}

const CancelBtn = ({ cancel, cancelBtnLabel, t, ...other }) => {
    return (
        <Button label={t(cancelBtnLabel || 'CANCEL')} onClick={cancel} />
    )
}

const SaveBtnWithTransaction = TransactionHoc(SaveBtn)
const CancelBtnWithTransaction = TransactionHoc(CancelBtn)

const txCommon = {
    SaveBtn: SaveBtnWithTransaction,
    CancelBtn: CancelBtnWithTransaction,
    stepsPreviewPage: { title: 'PREVIEW_AND_MAKE_TR', page: TransactionPreview },
    validateIdBase: 'tx-',
    darkerBackground: true
}

export const Approve = (props) =>
    <FormStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_APPROVE_BTN"
        saveBtnLabel='ACC_APPROVE_SAVE_BTN'
        title="ACCOUNT_APPROVE_TITLE"
        stepsId='approve'
        {...txCommon}
        stepsPages={[{ title: 'ACCOUNT_APPROVE_STEP', page: ApproveStep }]}
        //TODO: refactor the stepper. This is not cool :)
        // Until the refactor we will use mapping function from account and transaction hoc to specific sc function
        saveFn={({ acc, transaction } = {}) => {
            return approveTokens({ _addr: acc._addr, amountToApprove: transaction.allowance, gas: transaction.gas })
        }}
    />

export const WithdrawEth = (props) =>
    <FormStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_WITHDRAW_ETH_BTN"
        saveBtnLabel='ACC_WITHDRAW_ETH_SAVE_BTN'
        title="ACCOUNT_WITHDRAW_ETH_TITLE"
        stepsId='withdrawEth'
        {...txCommon}
        stepsPages={[{ title: 'ACCOUNT_WITHDRAW_ETH_STEP', page: WithdrawStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return withdrawEth(
                {
                    user: acc,
                    _addr: acc._addr,
                    withdrawTo: transaction.withdrawTo,
                    amountToWithdraw: transaction.amountToWithdraw,
                    gas: transaction.gas
                })
        }}
        estimateGasFn={({ acc, transaction } = {}) => {
            return withdrawEth(
                {
                    user: acc,
                    _addr: acc._addr,
                    withdrawTo: transaction.withdrawTo,
                    amountToWithdraw: transaction.amountToWithdraw,
                    gas: transaction.gas,
                    estimateGasOnly: true
                })
        }}
    />

export const WithdrawAdx = (props) =>
    <FormStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_WITHDRAW_ADX_BTN"
        saveBtnLabel='ACC_WITHDRAW_ADX_SAVE_BTN'
        title="ACCOUNT_WITHDRAW_ADX_TITLE"
        stepsId='withdrawAdx'
        {...txCommon}
        stepsPages={[{ title: 'ACCOUNT_WITHDRAW_ADX_STEP', page: WithdrawStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return withdrawAdx(
                {
                    user: acc,
                    _addr: acc._addr,
                    withdrawTo: transaction.withdrawTo,
                    amountToWithdraw: transaction.amountToWithdraw,
                    gas: transaction.gas
                })
        }}
        estimateGasFn={({ acc, transaction } = {}) => {
            return withdrawAdx(
                {
                    user: acc,
                    _addr: acc._addr,
                    withdrawTo: transaction.withdrawTo,
                    amountToWithdraw: transaction.amountToWithdraw,
                    gas: transaction.gas,
                    estimateGasOnly: true
                })
        }}
    />

export const AcceptBid = (props) =>
    < FormStepsWithDialog
        {...props}
        btnLabel="ACCEPT_BID"
        saveBtnLabel='ACCEPT_BID_SAVE_BTN'
        title="ACCEPT_BID_TITLE"
        stepsId={'accept_bid_slot_' + props.slotId + '_bid_' + props.bidId}
        {...txCommon}
        stepsPages={[{ title: 'ACCEPT_BID_STEP', page: AcceptBidStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return acceptBid(
                {
                    user: acc,
                    placedBid: transaction.placedBid,
                    _adSlot: transaction.slot._ipfs,
                    _addr: transaction.account._addr,
                    gas: transaction.gas
                })
                .then((res) => {
                    sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
                    return res
                })
        }}
        estimateGasFn={({ acc, transaction } = {}) => {
            return acceptBid(
                {
                    user: acc,
                    placedBid: transaction.placedBid,
                    _adSlot: transaction.slot._ipfs,
                    _addr: transaction.account._addr,
                    gas: transaction.gas,
                    estimateGasOnly: true
                })
        }}
    />

export const CancelBid = (props) =>
    < FormStepsWithDialog
        {...props}
        btnLabel="CANCEL_BID"
        saveBtnLabel='CANCEL_BID_SAVE_BTN'
        title="CANCEL_BID_TITLE"
        stepsId={'cancel_bid_adunit_' + props.unitId + '_bid_' + props.bidId}
        {...txCommon}
        stepsPages={[{ title: 'CANCEL_BID_STEP', page: CancelBidStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return cancelBid(
                {
                    user: acc,
                    placedBid: transaction.placedBid,
                    _adUnit: transaction.unit._ipfs,
                    _addr: transaction.account._addr,
                    gas: transaction.gas
                })
                .then((res) => {
                    sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
                    return res
                })
        }}
        estimateGasFn={({ acc, transaction } = {}) => {
            return cancelBid(
                {
                    user: acc,
                    placedBid: transaction.placedBid,
                    _adUnit: transaction.unit._ipfs,
                    _addr: transaction.account._addr,
                    gas: transaction.gas,
                    estimateGasOnly: true
                })
        }}
    />

export const VerifyBid = (props) =>
    < FormStepsWithDialog
        {...props}
        btnLabel="VERIFY_BID"
        saveBtnLabel='VERIFY_BID_SAVE_BTN'
        title="VERIFY_BID_TITLE"
        stepsId={'verify_bid_item_' + props.itemId + '_bid_' + props.bidId}
        {...txCommon}
        stepsPages={[{ title: 'VERIFY_BID_STEP', page: VerifyBidStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return verifyBid(
                {
                    user: acc,
                    placedBid: transaction.placedBid,
                    _report: transaction.report.ipfs,
                    _addr: acc._addr,
                    gas: transaction.gas,
                    side: transaction.side
                })
                .then((res) => {
                    sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
                    return res
                })
        }}
        estimateGasFn={({ acc, transaction } = {}) => {
            return verifyBid(
                {
                    user: acc,
                    placedBid: transaction.placedBid,
                    _report: transaction.report.ipfs,
                    _addr: acc._addr,
                    gas: transaction.gas,
                    side: transaction.side,
                    estimateGasOnly: true
                })
        }}
    />

export const GiveupBid = (props) =>
    < FormStepsWithDialog
        {...props}
        btnLabel="GIVEUP_BID"
        saveBtnLabel='GIVEUP_BID_SAVE_BTN'
        title="GIVEUP_BID_TITLE"
        stepsId={'giveup_bid_slot_' + props.slotId + '_bid_' + props.bidId}
        {...txCommon}
        stepsPages={[{ title: 'GIVEUP_BID_STEP', page: VerifyBidStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return giveupBid(
                {
                    user: acc,
                    placedBid: transaction.placedBid,
                    _addr: acc._addr,
                    gas: transaction.gas,
                })
                .then((res) => {
                    sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
                    return res
                })
        }}
        estimateGasFn={({ acc, transaction } = {}) => {
            return giveupBid(
                {
                    user: acc,
                    placedBid: transaction.placedBid,
                    _addr: acc._addr,
                    gas: transaction.gas,
                    estimateGasOnly: true
                })
        }}
    />


export const RefundBid = (props) =>
    < FormStepsWithDialog
        {...props}
        btnLabel="REFUND_BID"
        saveBtnLabel='REFUND_BID_SAVE_BTN'
        title="REFUND_BID_TITLE"
        stepsId={'refund_bid_unit_' + props.unitId + '_bid_' + props.bidId}
        {...txCommon}
        stepsPages={[{ title: 'REFUND_BID_STEP', page: VerifyBidStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return refundBid(
                {
                    user: acc,
                    placedBid: transaction.placedBid,
                    _addr: acc._addr,
                    gas: transaction.gas,
                })
                .then((res) => {
                    sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
                    return res
                })
        }}
        estimateGasFn={({ acc, transaction } = {}) => {
            return refundBid(
                {
                    user: acc,
                    placedBid: transaction.placedBid,
                    _addr: acc._addr,
                    gas: transaction.gas,
                    estimateGasOnly: true
                })
        }}
    />

export const Deposit = (props) =>
    <FormStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_DEPOSIT_TO_EXCHANGE_BTN"
        saveBtnLabel='ACCOUNT_DEPOSIT_TO_EXCHANGE_SAVE_BTN'
        title="ACCOUNT_DEPOSIT_TO_EXCHANGE_TITLE"
        stepsId='depositToExchange'
        {...txCommon}
        stepsPages={[{ title: 'ACCOUNT_DEPOSIT_TO_EXCHANGE_STEP', page: DepositToExchange }]}
        previewWarnMsgs={[{ msg: 'ACCOUNT_DEPOSIT_MULTIPLE_SIGNS_MSG' }]}
        saveFn={({ acc, transaction } = {}) => {
            return depositToExchange({ user: acc, _addr: acc._addr, amountToDeposit: transaction.depositAmount, gas: transaction.gas })
        }}
        estimateGasFn={({ acc, transaction } = {}) => {
            return depositToExchangeEG({ user: acc, _addr: acc._addr, amountToDeposit: transaction.depositAmount, gas: transaction.gas })
        }}
    />

export const WithdrawFromExchange = (props) =>
    <FormStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_WITHDRAW_FROM_EXCHANGE_BTN"
        saveBtnLabel='ACCOUNT_WITHDRAW_FROM_EXCHANGE_SAVE_BTN'
        title="ACCOUNT_WITHDRAW_FROM_EXCHANGE_TITLE"
        stepsId='withdrawFromExchange'
        {...txCommon}
        stepsPages={[{ title: 'ACCOUNT_WITHDRAW_FROM_EXCHANGE_STEP', page: WithdrawFromExchangePage }]}
        saveFn={({ acc, transaction } = {}) => {
            return withdrawFromExchange({ _addr: acc._addr, amountToWithdraw: transaction.withdrawAmount, gas: transaction.gas, user: acc, })
        }}
        estimateGasFn={({ acc, transaction } = {}) => {
            return withdrawFromExchange({ _addr: acc._addr, amountToWithdraw: transaction.withdrawAmount, gas: transaction.gas, user: acc, estimateGasOnly: true })
        }}
    />