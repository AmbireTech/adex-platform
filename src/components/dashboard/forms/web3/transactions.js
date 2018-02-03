import React from 'react'

import TransactionsSteps from './TransactionsSteps'
import NewItemWithDialog from 'components/dashboard/forms/items/NewItemWithDialog'
import ApproveStep from './ApproveStep'
import WithdrawStep from './WithdrawStep'
import scActions from 'services/smart-contracts/actions'
const {
    getAccountStats,
    approveTokens,
    withdrawEth,
    withdrawAdx,
    withdrawAdxEstimateGas,
    withdrawEthEstimateGas,
    acceptBid

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
            return approveTokens({ _addr: acc._temp.addr, amountToApprove: transaction.allowance, gas: transaction.gas })
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
                    _addr: acc._temp.addr,
                    withdrawTo: transaction.withdrawTo,
                    amountToWithdraw: transaction.amountToWithdraw,
                    prKey: acc._temp.privateKey,
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
                    _addr: acc._temp.addr,
                    withdrawTo: transaction.withdrawTo,
                    amountToWithdraw: transaction.amountToWithdraw,
                    prKey: acc._temp.privateKey,
                    gas: transaction.gas
                })
        }}
        estimateGasFn={withdrawAdxEstimateGas}
    />

export const AcceptBid = (props) =>
    < TransactionsStepsWithDialog
        {...props }
        btnLabel="ACCEPT_BID"
        saveBtnLabel='ACCEPT_BID_SAVE_BTN'
        title="ACCEPT_BID_TITLE"
        trId={'accept_bid_slot_' + props.slotId + '_bid_' + props.bidId}
        trPages={[{ title: 'ACCEPT_BID_STEP', page: (pr) => (<strong> test </strong>) }]}
        saveFn={({ acc, transaction } = {}) => {
            return acceptBid(
                {
                    _advertiser: transaction._advertiser,
                    _adunit: transaction._adunit,
                    _opened: transaction._opened,
                    _target: transaction._target,
                    _amount: transaction._amount,
                    _timeout: transaction._timeout,
                    _adslot: transaction._adslot,
                    v: transaction.v,
                    r: transaction.r,
                    s: transaction.s,
                    _addr: transaction._addr,
                    gas: transaction.gas,
                    gasPrice: transaction._gasPrice
                })
        }}
        estimateGasFn={() => 100000}
    />