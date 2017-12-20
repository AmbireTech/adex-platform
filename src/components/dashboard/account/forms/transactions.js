import React from 'react'

import { ItemsTypes } from 'constants/itemsTypes'
import TransactionsSteps from './TransactionsSteps'
import NewItemWithDialog from 'components/dashboard/forms/NewItemWithDialog'
import ApproveStep from './ApproveStep'
import RegisterStep from './RegisterStep'
import WithdrawEthStep from './WithdrawEthStep'
import scActions from 'services/smart-contracts/actions'
const { getAccountStats, approveTokens, registerAccount, withdrawEth } = scActions

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
            return approveTokens({ _addr: acc._addr, amountToApprove: transaction.allowance })
        }}
    />

export const RegisterAccount = (props) =>
    <TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_REGISTER_ACC_BTN"
        saveBtnLabel='ACC_REGISTER_ACC_SAVE_BTN'
        title="ACCOUNT_REGISTER_ACC_TITLE"
        trId='registerAccount'
        trPages={[{ title: 'ACCOUNT_REGISTER_ACC_STEP', page: RegisterStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return registerAccount({ _addr: acc._addr, _name: transaction.name, prKey: acc._temp.privateKey })
        }}
    />

export const WithdrawEth = (props) =>
    <TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_WITHDRAW_ETH_BTN"
        saveBtnLabel='ACC_WITHDRAW_ETH_SAVE_BTN'
        title="ACCOUNT_WITHDRAW_ETH_TITLE"
        trId='withdrawEth'
        trPages={[{ title: 'ACCOUNT_WITHDRAW_ETH_STEP', page: WithdrawEthStep }]}
        saveFn={({ acc, transaction } = {}) => {
            return withdrawEth(
                {
                    _addr: acc._addr,
                    withdrawTo: transaction.withdrawTo,
                    amountToWithdraw: transaction.amountToWithdraw,
                    prKey: acc._temp.privateKey
                })
        }}
    />