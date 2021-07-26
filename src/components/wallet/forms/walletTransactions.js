import React from 'react'
import WalletSwapTokensStep from './SwapStep'
import WalletDiversifyTokensStep from './DiversifyStep'
import WalletWithdrawStep from './WalletWithdrawStep'
import TransactionPreview from './WalletTransactionPreview'
import SeAddressPrivilege from 'components/dashboard/forms/web3/SeAddressPrivilege'
import FormSteps from 'components/common/stepper/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
import {
	walletTrade,
	validateWalletTrade,
	completeTx,
	execute,
	resetNewTransaction,
	resetValidationErrors,
	validateWalletDiversify,
	walletDiversification,
	validateWalletWithdraw,
	walletWithdraw,
	walletValidatePrivilegesChange,
	walletUpdateIdentityPrivilege,
} from 'actions'
import ReactGA from 'react-ga'

const FormStepsWithDialog = WithDialog(FormSteps)

const cancelFunction = stepsId => {
	execute(resetNewTransaction({ tx: stepsId }))
	// TODO: bind with form steps length
	for (let i = 0; i <= 1; i++) {
		execute(resetValidationErrors(stepsId + '-' + i))
	}
}

const txCommon = {
	cancelFunction,
	darkerBackground: true,
}

export const TradeAssets = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='WALLET_SWAP_BTN'
		saveBtnLabel='WALLET_SWAP_SAVE_BTN'
		title='WALLET_SWAP_FORM_TITLE'
		stepsId='walletSwapForm'
		{...txCommon}
		hideNav={true}
		steps={[
			{
				title: 'WALLET_SWAP_FORM_TITLE',
				component: WalletSwapTokensStep,
				validationFn: props => {
					execute(validateWalletTrade(props))
					// TODO: Proper GA events
					// ReactGA.event({
					// 	action: 'wallet',
					// 	category: 'trade',
					// 	label: 'continue',
					// })
				},
			},
			{
				title: 'PREVIEW_WALLET',
				completeBtnTitle: 'PROCEED',
				component: TransactionPreview,
				completeFn: props =>
					execute(
						completeTx({
							...props,
							competeAction: walletTrade,
						})
					),
			},
		]}
	/>
)

export const DiversifyAssets = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='WALLET_DIVERSIFY_BTN'
		saveBtnLabel='WALLET_DIVERSIFY_SAVE_BTN'
		title='WALLET_DIVERSIFY_FORM_TITLE'
		stepsId='walletDiversifyForm'
		{...txCommon}
		hideNav={true}
		steps={[
			{
				title: 'WALLET_DIVERSIFY_FORM_TITLE',
				component: WalletDiversifyTokensStep,
				validationFn: async props => {
					await execute(validateWalletDiversify(props))
				},
			},
			{
				title: 'PREVIEW_WALLET',
				completeBtnTitle: 'PROCEED',
				component: TransactionPreview,
				completeFn: async props =>
					await execute(
						completeTx({
							...props,
							competeAction: walletDiversification,
						})
					),
			},
		]}
	/>
)

export const WithdrawAsset = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='WALLET_WITHDRAW_ASSET_BTN'
		saveBtnLabel='WALLET_WITHDRAW_ASSET_SAVE_BTN'
		title='WALLET_WITHDRAW_ASSET_TITLE'
		stepsId={`walletWithdraw-${props.stepsProps.withdrawAsset}`}
		{...txCommon}
		hideNav={true}
		steps={[
			{
				title: 'WALLET_WITHDRAW_ASSET_TITLE',
				component: WalletWithdrawStep,
				validationFn: props => {
					execute(validateWalletWithdraw(props))
					ReactGA.event({
						action: 'wallet',
						category: 'withdraw',
						label: 'continue',
					})
				},
			},
			{
				title: 'PREVIEW_WALLET',
				completeBtnTitle: 'PROCEED',
				component: TransactionPreview,
				completeFn: props =>
					execute(
						completeTx({
							...props,
							competeAction: walletWithdraw,
						})
					),
			},
		]}
	/>
)

export const WalletSetIdentityPrivilege = ({ SaveBtn, label, ...props }) => {
	return (
		<FormStepsWithDialog
			{...props}
			btnLabel={label || 'ACCOUNT_SET_IDENTITY_PRIVILEGE_BTN'}
			saveBtnLabel='ACCOUNT_SET_IDENTITY_PRIVILEGE_SAVE_BTN'
			title='ACCOUNT_SET_IDENTITY_PRIVILEGE_TITLE'
			stepsId='setIdentityPrivilege'
			{...txCommon}
			steps={[
				{
					title: 'ACCOUNT_SET_IDENTITY_PRIVILEGE_STEP',
					component: SeAddressPrivilege,
					validationFn: props => execute(walletValidatePrivilegesChange(props)),
				},
				{
					title: 'PREVIEW_AND_MAKE_TX',
					completeBtnTitle: 'PROCEED',
					component: TransactionPreview,
					completeFn: props =>
						execute(
							completeTx({
								...props,
								competeAction: walletUpdateIdentityPrivilege,
							})
						),
				},
			]}
		/>
	)
}
