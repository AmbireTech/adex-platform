import React from 'react'

import { ItemsTypes } from 'constants/itemsTypes'
import TransactionsSteps from './TransactionsSteps'
import NewItemWithDialog from 'components/dashboard/forms/NewItemWithDialog'
import ApproveStep from './ApproveStep'
import scActions from 'services/smart-contracts/actions'
const { getAccountStats, approveTokens } = scActions

const TransactionsStepsWithDialog = NewItemWithDialog(TransactionsSteps)

export const APPROVE = (props) =>
    <TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_APPROVE_BTN"
        title="ACCOUNT_APPROVE_TITLE"
        trId='approve'
        trPages={[{ title: 'ACCOUNT_APPROVE_STEP', page: ApproveStep }]}
        //TODO: refactor the stepper. This is not cool :)
        // Until the refactor we will use mapping function from account and transaction hoc to specific sc function
        saveFn={({ acc, transaction } = {}) => {
            return approveTokens({ _addr: acc._addr, amountToApprove: transaction.allowance })
        }}
    />