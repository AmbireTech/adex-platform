import React from 'react'

import { ItemsTypes } from 'constants/itemsTypes'
import TransactionsSteps from './TransactionsSteps'
import NewItemWithDialog from 'components/dashboard/forms/NewItemWithDialog'
import ApproveStep from './ApproveStep'

const TransactionsStepsWithDialog = NewItemWithDialog(TransactionsSteps)

export const APPROVE = (props) =>
    <TransactionsStepsWithDialog
        {...props}
        btnLabel="ACCOUNT_APPROVE_BTN"
        title="ACCOUNT_APPROVE_TITLE"
        trId='approve'
        trPages={[{ title: 'ACCOUNT_APPROVE_STEP', page: ApproveStep }]}
    />