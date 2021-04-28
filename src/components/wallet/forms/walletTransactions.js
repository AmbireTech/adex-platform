import React from 'react'
import WalletSwapTokensStep from './SwapStep'
import TransactionPreview from 'components/dashboard/forms/web3/TransactionPreview.js'
import FormSteps from 'components/common/stepper/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
import {
	walletTrade,
	validateWalletTrade,
	completeTx,
	execute,
	resetNewTransaction,
	resetValidationErrors,
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
