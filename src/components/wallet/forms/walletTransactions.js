import React from 'react'
import WalletSwapTokensStep from './SwapStep'
import WalletDiversifyTokensStep from './DiversifyStep'
import TransactionPreview from './WalletTransactionPreview'
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
					ReactGA.event({
						action: 'wallet',
						category: 'trade',
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
				validationFn: props => {
					execute(validateWalletDiversify(props))
					ReactGA.event({
						action: 'wallet',
						category: 'diversify',
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
							competeAction: walletDiversification,
						})
					),
			},
		]}
	/>
)
