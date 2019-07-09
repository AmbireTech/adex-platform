import React from 'react'
import WithdrawFromExchangePage from './WithdrawFromIdentity'
import SeAddressPrivilege from './SeAddressPrivilege'
import TransactionPreview from './TransactionPreview'
import Button from '@material-ui/core/Button'
import TransactionHoc from './TransactionHoc'
import FormSteps from 'components/dashboard/forms/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
// import SaveIcon from '@material-ui/icons/Save'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import {
	withdrawFromIdentity,
	setIdentityPrivilege
} from 'services/smart-contracts/actions/identity'

const FormStepsWithDialog = WithDialog(FormSteps)

const SaveBtn = ({ save, saveBtnLabel, saveBtnIcon, t, transaction, waitingForWalletAction, spinner, ...other }) => {
	return (
		<Button
			color='primary'
			onClick={save}
			disabled={(transaction.errors && transaction.errors.length) || transaction.waitingForWalletAction || spinner}
		>
			{transaction.waitingForWalletAction ? <HourglassEmptyIcon /> : (saveBtnIcon || '')}
			{t(saveBtnLabel || 'DO_IT')}
		</Button>
	)
}

const CancelBtn = ({ cancel, cancelBtnLabel, t, ...other }) => {
	return (
		<Button
			onClick={cancel}
		>
			{t(cancelBtnLabel || 'CANCEL')}
		</Button>
	)
}

const SaveBtnWithTransaction = TransactionHoc(SaveBtn)
const CancelBtnWithTransaction = TransactionHoc(CancelBtn)

const txCommon = {
	SaveBtn: SaveBtnWithTransaction,
	CancelBtn: CancelBtnWithTransaction,
	validateIdBase: 'tx-',
	darkerBackground: true
}

export const WithdrawTokenFromIdentity = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="ACCOUNT_WITHDRAW_FROM_IDENTITY_BTN"
		saveBtnLabel='ACCOUNT_WITHDRAW_FROM_IDENTITY_SAVE_BTN'
		title="ACCOUNT_WITHDRAW_FROM_IDENTITY_TITLE"
		stepsId='withdrawFromIdentity'
		{...txCommon}
		stepsPages={[{ title: 'ACCOUNT_WITHDRAW_FROM_IDENTITY_STEP', page: WithdrawFromExchangePage }]}
		stepsPreviewPage={{ title: 'PREVIEW_AND_MAKE_TR', page: TransactionPreview }}
		saveFn={({ transaction } = {}) => {
			return props.actions.identityWithdraw({
				amountToWithdraw: transaction.withdrawAmount,
				withdrawTo: transaction.withdrawTo,
			})
		}}
		getFeesFn={({ transaction } = {}) => {
			return withdrawFromIdentity({
				amountToWithdraw: transaction.withdrawAmount,
				getFeesOnly: true
			})
		}}
	/>


export const SetIdentityPrivilege = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="ACCOUNT_SET_IDENTITY_PRIVILEGE_BTN"
		saveBtnLabel='ACCOUNT_SET_IDENTITY_PRIVILEGE_SAVE_BTN'
		title="ACCOUNT_SET_IDENTITY_PRIVILEGE_TITLE"
		stepsId='setIdentityPrivilege'
		{...txCommon}
		stepsPages={[{ title: 'ACCOUNT_SET_IDENTITY_PRIVILEGE_STEP', page: SeAddressPrivilege }]}
		stepsPreviewPage={{ title: 'PREVIEW_AND_MAKE_TR', page: TransactionPreview }}
		saveFn={({ transaction } = {}) => {
			return props.actions.addrIdentityPrivilege({
				privLevel: transaction.privLevel,
				setAddr:  transaction.setAddr
			})
		}}
		getFeesFn={({ transaction } = {}) => {
			return setIdentityPrivilege({
				privLevel: transaction.privLevel,
				setAddr:  transaction.setAddr,
				getFeesOnly: true
			})
		}}
	/>