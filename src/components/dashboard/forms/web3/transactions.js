import React from 'react'

import TransactionsSteps from './TransactionsSteps'
import NewItemWithDialog from 'components/dashboard/forms/items/NewItemWithDialog'
import ApproveStep from './ApproveStep'
import WithdrawStep from './WithdrawStep'
import DepositToExchange from './DepositToExchange'
import WithdrawFromExchangePage from './WithdrawFromExchange'
import AuthenticateStepGetToken from './AuthenticateStepGetToken'
import AcceptBidStep from './AcceptBid'
import CancelBidStep from './CancelBid'
import VerifyBidStep from './VerifyBid'
import GiveupBidStep from './GiveupBid'
import RefundBidStep from './RefundBid'
import scActions from 'services/smart-contracts/actions'
import { signToken, sendBidState } from 'services/adex-node/actions'

const {
    getAccountStats,
    approveTokens,
    withdrawEth,
    withdrawAdx,
    withdrawAdxEstimateGas,
    withdrawEthEstimateGas,
    acceptBid,
    cancelBid,
    verifyBid,
    giveupBid,
    refundBid,
    signAuthToken,
    depositToExchange,
    withdrawFromExchange
} = scActions

const TransactionsStepsWithDialog = NewItemWithDialog(TransactionsSteps)

export const Approve = (props) =>
    <TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_APPROVE_BTN"
        saveBtnLabel='ACC_APPROVE_SAVE_BTN'
        title="ACCOUNT_APPROVE_TITLE"
        trId='approve'
        trPages={[{ title: 'ACCOUNT_APPROVE_STEP', page: ApproveStep }]}
        //TODO: refactor the stepper. This is not cool :)
        // Until the refactor we will use mapping function from account and transaction hoc to specific sc function
        saveFn={({ acc, transaction } = {}) => {
            return approveTokens({ _addr: acc._addr, amountToApprove: transaction.allowance, gas: transaction.gas })
        }}
    />

export const WithdrawEth = (props) =>
    <TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_WITHDRAW_ETH_BTN"
        saveBtnLabel='ACC_WITHDRAW_ETH_SAVE_BTN'
        title="ACCOUNT_WITHDRAW_ETH_TITLE"
        trId='withdrawEth'
        trPages={[{ title: 'ACCOUNT_WITHDRAW_ETH_STEP', page: WithdrawStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return withdrawEth(
                {
                    _addr: acc._addr,
                    withdrawTo: transaction.withdrawTo,
                    amountToWithdraw: transaction.amountToWithdraw,
                    gas: transaction.gas
                })
        }}
        estimateGasFn={withdrawEthEstimateGas}
    />

export const WithdrawAdx = (props) =>
    <TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_WITHDRAW_ADX_BTN"
        saveBtnLabel='ACC_WITHDRAW_ADX_SAVE_BTN'
        title="ACCOUNT_WITHDRAW_ADX_TITLE"
        trId='withdrawAdx'
        trPages={[{ title: 'ACCOUNT_WITHDRAW_ADX_STEP', page: WithdrawStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return withdrawAdx(
                {
                    _addr: acc._addr,
                    withdrawTo: transaction.withdrawTo,
                    amountToWithdraw: transaction.amountToWithdraw,
                    gas: transaction.gas
                })
        }}
        estimateGasFn={withdrawAdxEstimateGas}
    />

export const AcceptBid = (props) =>
    < TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCEPT_BID"
        saveBtnLabel='ACCEPT_BID_SAVE_BTN'
        title="ACCEPT_BID_TITLE"
        trId={'accept_bid_slot_' + props.slotId + '_bid_' + props.bidId}
        trPages={[{ title: 'ACCEPT_BID_STEP', page: AcceptBidStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return new Promise((resolve, reject) => {
                acceptBid(
                    {
                        placedBid: transaction.placedBid,
                        _adSlot: transaction.slot._ipfs,
                        _addr: transaction.account._addr,
                        gas: transaction.gas,
                        gasPrice: transaction._gasPrice
                    })
                    .then((res) => {
                        return sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
                    })
                    .catch((err) => {
                        console.log('AcceptBid err', err)
                        //TODO: handle errors
                    })
            })
        }}
        estimateGasFn={() => 100000}
    />

export const CancelBid = (props) =>
    < TransactionsStepsWithDialog
        {...props}
        btnLabel="CANCEL_BID"
        saveBtnLabel='CANCEL_BID_SAVE_BTN'
        title="CANCEL_BID_TITLE"
        trId={'cancel_bid_adunit_' + props.unitId + '_bid_' + props.bidId}
        trPages={[{ title: 'CANCEL_BID_STEP', page: CancelBidStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return new Promise((resolve, reject) => {
                cancelBid(
                    {
                        placedBid: transaction.placedBid,
                        _adUnit: transaction.unit._ipfs,
                        _addr: transaction.account._addr,
                        gas: transaction.gas,
                        gasPrice: transaction._gasPrice
                    })
                    .then((res) => {
                        return sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
                    })
                    .catch((err) => {
                        console.log('CancelBid err', err)
                        //TODO: handle errors
                    })
            })
        }}
        estimateGasFn={() => 300000}
    />

export const VerifyBid = (props) =>
    < TransactionsStepsWithDialog
        {...props}
        btnLabel="VERIFY_BID"
        saveBtnLabel='VERIFY_BID_SAVE_BTN'
        title="VERIFY_BID_TITLE"
        trId={'verify_bid_item_' + props.itemId + '_bid_' + props.bidId}
        trPages={[{ title: 'VERIFY_BID_STEP', page: VerifyBidStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return new Promise((resolve, reject) => {
                verifyBid(
                    {
                        placedBid: transaction.placedBid,
                        _report: transaction.report,
                        _addr: acc._addr,
                        gas: transaction.gas,
                        gasPrice: transaction._gasPrice
                    })
                    .then((res) => {
                        return resolve(res)
                        // return sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
                    })
                    .catch((err) => {
                        console.log('VerifyBid err', err)
                        //TODO: handle errors
                    })
            })
        }}
        estimateGasFn={() => 300000}
    />

export const GiveupBid = (props) =>
    < TransactionsStepsWithDialog
        {...props}
        btnLabel="GIVEUP_BID"
        saveBtnLabel='GIVEUP_BID_SAVE_BTN'
        title="GIVEUP_BID_TITLE"
        trId={'giveup_bid_slot_' + props.slotId + '_bid_' + props.bidId}
        trPages={[{ title: 'GIVEUP_BID_STEP', page: GiveupBidStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return new Promise((resolve, reject) => {
                giveupBid(
                    {
                        placedBid: transaction.placedBid,
                        _addr: acc._addr,
                        gas: transaction.gas,
                        gasPrice: transaction._gasPrice
                    })
                    .then((res) => {
                        return sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
                    })
                    .catch((err) => {
                        console.log('GiveupBid err', err)
                        //TODO: handle errors
                    })
            })
        }}
        estimateGasFn={() => 300000}
    />


export const RefundBid = (props) =>
    < TransactionsStepsWithDialog
        {...props}
        btnLabel="REFUND_BID"
        saveBtnLabel='REFUND_BID_SAVE_BTN'
        title="REFUND_BID_TITLE"
        trId={'refund_bid_unit_' + props.unitId + '_bid_' + props.bidId}
        trPages={[{ title: 'VERIFY_BID_STEP', page: RefundBidStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return new Promise((resolve, reject) => {
                refundBid(
                    {
                        placedBid: transaction.placedBid,
                        _addr: acc._addr,
                        gas: transaction.gas,
                        gasPrice: transaction._gasPrice
                    })
                    .then((res) => {
                        return sendBidState({ bidId: res.bidId, state: res.state, trHash: res.trHash, authSig: acc._authSig })
                    })
                    .catch((err) => {
                        console.log('RefundBid err', err)
                        //TODO: handle errors
                    })
            })
        }}
        estimateGasFn={() => 300000}
    />

export const Authenticate = (props) =>
    <TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_AUTHENTICATE"
        saveBtnLabel='ACCOUNT_AUTHENTICATE'
        title="ACCOUNT_AUTHENTICATE_TITLE"
        trId='authenticateAcc'
        trPages={[{ title: 'ACCOUNT_AUTHENTICATE_STEP', page: AuthenticateStepGetToken }]}
        saveFn={({ acc, transaction } = {}) => {
            return new Promise((resolve, reject) => {
                let signature = null
                signAuthToken({ userAddr: acc._addr, authToken: transaction.authToken })
                    .then((sig) => {
                        signature = sig
                        return signToken({ userid: acc._addr, signature: signature, authToken: transaction.authToken })
                    })
                    .then((res) => {
                        // TEMP
                        // TODO: keep it here or make it on login?
                        // TODO: catch
                        if (res === 'OK') {
                            localStorage.setItem('addr-sig-' + acc._addr, signature)
                        }

                        return resolve('OK')
                    })
            })
        }}
    />

export const Deposit = (props) =>
    <TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_DEPOSIT_TO_EXCHANGE_BTN"
        saveBtnLabel='ACCOUNT_DEPOSIT_TO_EXCHANGE_SAVE_BTN'
        title="ACCOUNT_DEPOSIT_TO_EXCHANGE_TITLE"
        trId='deposit'
        trPages={[{ title: 'ACCOUNT_DEPOSIT_TO_EXCHANGE_STEP', page: DepositToExchange }]}
        saveFn={({ acc, transaction } = {}) => {
            return depositToExchange({ _addr: acc._addr, amountToDeposit: transaction.depositAmount, gas: transaction.gas })
        }}
    />

export const WithdrawFromExchange = (props) =>
    <TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_WITHDRAW_FROM_EXCHANGE_BTN"
        saveBtnLabel='ACCOUNT_WITHDRAW_FROM_EXCHANGE_SAVE_BTN'
        title="ACCOUNT_WITHDRAW_FROM_EXCHANGE_TITLE"
        trId='withdrawWromExchange'
        trPages={[{ title: 'ACCOUNT_WITHDRAW_FROM_EXCHANGE_STEP', page: WithdrawFromExchangePage }]}
        saveFn={({ acc, transaction } = {}) => {
            return withdrawFromExchange({ _addr: acc._addr, amountToWithdraw: transaction.withdrawAmount, gas: transaction.gas })
        }}
    />