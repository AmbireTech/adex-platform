import React from 'react'
import WithdrawFromIdentity from './WithdrawFromIdentity'
import WithdrawAnyTokenFromIdentityPage from './WithdrawAnyTokenFromIdentity'
import SeAddressPrivilege from './SeAddressPrivilege'
import SetAccountENSPage from './SetAccountENSPage'
import TransactionPreview from './TransactionPreview'
import Button from '@material-ui/core/Button'
import TransactionHoc from './TransactionHoc'
import FormSteps from 'components/dashboard/forms/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
import { t } from 'selectors'
// import SaveIcon from '@material-ui/icons/Save'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import {
	withdrawFromIdentity,
	setIdentityPrivilege,
	addIdentityENS,
	withdrawOtherTokensFromIdentity,
} from 'services/smart-contracts/actions/identity'
import {
	addrIdentityPrivilege,
	identityWithdraw,
	setIdentityENS,
	validatePrivilegesChange,
	identityWithdrawAny,
	validateIdentityWithdraw,
	execute,
} from 'actions'

const FormStepsWithDialog = WithDialog(FormSteps)

const SaveBtn = ({
	save,
	saveBtnLabel,
	saveBtnIcon,
	t,
	transaction,
	waitingForWalletAction,
	spinner,
	...other
}) => {
	return (
		<Button
			color='primary'
			onClick={save}
			disabled={
				(!!transaction.errors && !!transaction.errors.length) ||
				!!transaction.waitingForWalletAction ||
				!!spinner
			}
		>
			{transaction.waitingForWalletAction ? (
				<HourglassEmptyIcon />
			) : (
				saveBtnIcon || ''
			)}
			{t(saveBtnLabel || 'DO_IT')}
		</Button>
	)
}

const CancelBtn = ({ cancel, cancelBtnLabel, t, ...other }) => {
	return <Button onClick={cancel}>{t(cancelBtnLabel || 'CANCEL')}</Button>
}

const SaveBtnWithTransaction = TransactionHoc(SaveBtn)
const CancelBtnWithTransaction = TransactionHoc(CancelBtn)

const txCommon = {
	SaveBtn: SaveBtnWithTransaction,
	CancelBtn: CancelBtnWithTransaction,
	validateIdBase: 'tx-',
	darkerBackground: true,
}

export const WithdrawTokenFromIdentity = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='ACCOUNT_WITHDRAW_FROM_IDENTITY_BTN'
		saveBtnLabel='ACCOUNT_WITHDRAW_FROM_IDENTITY_SAVE_BTN'
		title='ACCOUNT_WITHDRAW_FROM_IDENTITY_TITLE'
		stepsId='withdrawFromIdentity'
		{...txCommon}
		stepsPages={[
			{
				title: 'ACCOUNT_WITHDRAW_FROM_IDENTITY_STEP',
				page: WithdrawFromIdentity,
				pageValidation: ({ stepsId, validateId, dirty, onValid, onInvalid }) =>
					execute(
						validateIdentityWithdraw({
							stepsId,
							validateId,
							dirty,
							onValid,
							onInvalid,
						})
					),
			},
		]}
		stepsPreviewPage={{
			title: 'PREVIEW_AND_MAKE_TR',
			page: TransactionPreview,
		}}
		saveFn={({ transaction, account } = {}) => {
			return execute(
				identityWithdraw({
					amountToWithdraw: transaction.withdrawAmount,
					withdrawTo: transaction.withdrawTo,
					account,
				})
			)
		}}
		getFeesFn={({ transaction, account } = {}) => {
			return withdrawFromIdentity({
				amountToWithdraw: transaction.withdrawAmount,
				withdrawTo: transaction.withdrawTo,
				getFeesOnly: true,
				account,
			})
		}}
	/>
)

export const SetIdentityPrivilege = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='ACCOUNT_SET_IDENTITY_PRIVILEGE_BTN'
		saveBtnLabel='ACCOUNT_SET_IDENTITY_PRIVILEGE_SAVE_BTN'
		title='ACCOUNT_SET_IDENTITY_PRIVILEGE_TITLE'
		stepsId='setIdentityPrivilege'
		{...txCommon}
		stepsPages={[
			{
				title: 'ACCOUNT_SET_IDENTITY_PRIVILEGE_STEP',
				page: SeAddressPrivilege,
				pageValidation: ({ stepsId, validateId, dirty, onValid, onInvalid }) =>
					execute(
						validatePrivilegesChange({
							stepsId,
							validateId,
							dirty,
							onValid,
							onInvalid,
						})
					),
			},
		]}
		stepsPreviewPage={{
			title: 'PREVIEW_AND_MAKE_TR',
			page: TransactionPreview,
		}}
		saveFn={({ transaction } = {}) => {
			return execute(
				addrIdentityPrivilege({
					privLevel: transaction.privLevel,
					setAddr: transaction.setAddr,
				})
			)
		}}
		getFeesFn={({ transaction, account } = {}) => {
			return setIdentityPrivilege({
				privLevel: transaction.privLevel,
				setAddr: transaction.setAddr,
				getFeesOnly: true,
				account,
			})
		}}
	/>
)

export const WithdrawAnyTokenFromIdentity = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='ACCOUNT_WITHDRAW_ANY_FROM_IDENTITY_BTN'
		saveBtnLabel='ACCOUNT_WITHDRAW_FROM_IDENTITY_SAVE_BTN'
		title='ACCOUNT_WITHDRAW_FROM_IDENTITY_TITLE'
		stepsId='withdrawAnyFromIdentity'
		{...txCommon}
		stepsPages={[
			{
				title: 'ACCOUNT_WITHDRAW_FROM_IDENTITY_STEP',
				page: WithdrawAnyTokenFromIdentityPage,
			},
		]}
		stepsPreviewPage={{
			title: 'PREVIEW_AND_MAKE_TX',
			page: TransactionPreview,
		}}
		saveFn={({ transaction } = {}) => {
			return execute(identityWithdrawAny(transaction))
		}}
		getFeesFn={({ transaction = {}, account } = {}) => {
			return withdrawOtherTokensFromIdentity({
				...transaction,
				getFeesOnly: true,
				account,
			})
		}}
	/>
)

export const SetAccountENS = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='ACCOUNT_SET_ENS_BTN'
		saveBtnLabel='ACCOUNT_SET_ENS_SAVE_BTN'
		title='ACCOUNT_SET_ENS_TITLE'
		stepsId='setENS'
		{...txCommon}
		stepsPages={[
			{
				title: 'ACCOUNT_SET_ENS_STEP',
				page: SetAccountENSPage,
			},
		]}
		stepsPreviewPage={{
			title: 'PREVIEW_AND_MAKE_TR',
			page: TransactionPreview,
		}}
		saveFn={({ transaction } = {}) => {
			return execute(
				setIdentityENS({
					username: transaction.setEns,
				})
			)
		}}
		getFeesFn={({ account } = {}) => {
			return addIdentityENS({
				account,
				getFeesOnly: true,
			})
		}}
	/>
)
