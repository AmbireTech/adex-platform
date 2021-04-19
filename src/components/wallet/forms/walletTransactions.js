import React from 'react'
import TradeStep from './TradeStep'
import TransactionPreview from 'components/dashboard/forms/web3/TransactionPreview.js'
import FormSteps from 'components/common/stepper/FormSteps'
import WithDialog from 'components/common/dialog/WithDialog'
import {
	walletTrade,
	validateWalletTrade,
	completeTx,
	execute,
	resetNewTransaction,
} from 'actions'
import ReactGA from 'react-ga'

const FormStepsWithDialog = WithDialog(FormSteps)

const cancelFunction = stepsId => {
	execute(resetNewTransaction({ tx: stepsId }))
}

const txCommon = {
	cancelFunction,
	darkerBackground: true,
}

export const TradeAssets = props => (
	<FormStepsWithDialog
		{...props}
		btnLabel='WALLET_TRADE_BTN'
		saveBtnLabel='WALLET_TRADE_DAVE_BTN'
		title='WALLET_TRADE_FORM_TITLE'
		stepsId='walletTradeForm'
		{...txCommon}
		steps={[
			{
				title: 'WALLET_TRADE_FORM_TITLE',
				component: TradeStep,
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
