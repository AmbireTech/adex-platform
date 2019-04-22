import React from 'react'
import WithdrawStep from './WithdrawStep'
import SendToIdentity from './SendToIdentity'
import WithdrawFromExchangePage from './WithdrawFromExchange'
import TransactionPreview from './TransactionPreview'
import Button from '@material-ui/core/Button'
import TransactionHoc from './TransactionHoc'
import FormSteps from 'components/dashboard/forms/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
// import SaveIcon from '@material-ui/icons/Save'
import HourglassEmptyIcon from '@material-ui/icons/HourglassEmpty'
import { sendDaiToIdentity } from 'services/smart-contracts/actions/identity'

const {
	withdrawEth,
	withdrawToken,
	depositToIdentity,
	depositToIdentityEG,
	withdrawTokensFromIdentity
} = {} // TODO

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
	stepsPreviewPage: { title: 'PREVIEW_AND_MAKE_TR', page: TransactionPreview },
	validateIdBase: 'tx-',
	darkerBackground: true
}

export const WithdrawEth = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="ACCOUNT_TRANSFER_ETH_BTN"
		saveBtnLabel='ACC_TRANSFER_ETH_SAVE_BTN'
		title="ACCOUNT_TRANSFER_ETH_TITLE"
		stepsId='transferEthFromWallet'
		{...txCommon}
		stepsPages={[{ title: 'ACCOUNT_TRANSFER_ETH_STEP', page: WithdrawStep }]}
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

export const WithdrawTokens = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="ACCOUNT_WITHDRAW_TOKEN_BTN"
		saveBtnLabel='ACC_WITHDRAW_TOKEN_SAVE_BTN'
		title="ACCOUNT_WITHDRAW_TOKEN_TITLE"
		stepsId='withdrawToken'
		{...txCommon}
		stepsPages={[{ title: 'ACCOUNT_WITHDRAW_TOKEN_STEP', page: WithdrawStep }]}
		saveFn={({ acc, transaction } = {}) => {
			return withdrawToken(
				{
					user: acc,
					_addr: acc._addr,
					withdrawTo: transaction.withdrawTo,
					amountToWithdraw: transaction.amountToWithdraw,
					gas: transaction.gas
				})
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return withdrawToken(
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

export const DepositToken = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="WALLET_DEPOSIT_TO_IDENTITY_BTN"
		saveBtnLabel='WALLET_DEPOSIT_TO_IDENTITY_SAVE_BTN'
		title="WALLET_DEPOSIT_TO_IDENTITY_TITLE"
		stepsId='depositToIdentity'
		{...txCommon}
		stepsPages={[{ title: 'WALLET_DEPOSIT_TO_IDENTITY_STEP', page: SendToIdentity }]}
		saveFn={({ acc, transaction } = {}) => {
			return sendDaiToIdentity({
				account: acc,
				amountToSend: transaction.amountToSend,
				gas: transaction.gas
			})
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return sendDaiToIdentity({
				account: acc,
				amountToSend: transaction.amountToSend,
				gas: transaction.gas,
				estimateGasOnly: true
			})
		}}
	/>

export const WithdrawTokenFromIdentity = (props) =>
	<FormStepsWithDialog
		{...props}
		btnLabel="ACCOUNT_WITHDRAW_FROM_EXCHANGE_BTN"
		saveBtnLabel='ACCOUNT_WITHDRAW_FROM_EXCHANGE_SAVE_BTN'
		title="ACCOUNT_WITHDRAW_FROM_EXCHANGE_TITLE"
		stepsId='withdrawFromExchange'
		{...txCommon}
		stepsPages={[{ title: 'ACCOUNT_WITHDRAW_FROM_EXCHANGE_STEP', page: WithdrawFromExchangePage }]}
		saveFn={({ acc, transaction } = {}) => {
			return withdrawTokensFromIdentity({ _addr: acc._addr, amountToWithdraw: transaction.withdrawAmount, gas: transaction.gas, user: acc, })
		}}
		estimateGasFn={({ acc, transaction } = {}) => {
			return withdrawTokensFromIdentity({ _addr: acc._addr, amountToWithdraw: transaction.withdrawAmount, gas: transaction.gas, user: acc, estimateGasOnly: true })
		}}
	/>