import { generateMnemonic } from 'bip39'
import { parseUnits } from 'ethers/utils'
import { updateUiByIdentity, addToast, updateSpinner, execute } from 'actions'

import {
	selectMainToken,
	t,
	selectAccountIdentity,
	selectAccount,
	selectBtcToMainTokenSwapTxns,
} from 'selectors'
import { initiateBtcToDaiSwap, erc20SwapWithdraw } from 'services/jellyswap'

export function updateBtcToMainTokenSwapTxns(tx) {
	return async function(dispatch, getState) {
		try {
			const txns = selectBtcToMainTokenSwapTxns(getState())
			const newTxns = { ...txns }
			newTxns[tx.id] = tx
			await updateUiByIdentity('btcToMainTokenSwapTxns', newTxns)(
				dispatch,
				getState
			)
		} catch (err) {
			console.error('ERR_UPDATING_BTC_TO_MAIN_TOKEN_SWAP_TXNS', err)
			addToast({
				type: 'cancel',
				label: t('ERR_UPDATING_BTC_TO_MAIN_TOKEN_SWAP_TXNS'),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function onBtcContractCreated({
	event,
	secret,
	identityAddr,
	account,
	tokenAddress,
}) {
	return async function(dispatch, getState) {
		const tx = { ...event }
		tx.secret = secret
		execute(updateBtcToMainTokenSwapTxns(tx))

		try {
			const { erc20Contract, result } = await erc20SwapWithdraw({
				id: tx.id,
				identityAddr,
				account,
				secret,
				tokenAddress,
			})

			await updateSpinner(event.transactionHash, false)(dispatch)
		} catch (err) {
			console.error('ERR_UPDATING_BTC_TO_MAIN_TOKEN_SWAP_ERC20_WITHDRAW', err)
			addToast({
				type: 'cancel',
				label: t('ERR_UPDATING_BTC_TO_MAIN_TOKEN_SWAP_ERC20_WITHDRAW'),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function swapBtcToMainToken({ btcWallet, btcAmount, tokenAmount }) {
	return async function(dispatch, getState) {
		const state = getState()
		const identityAddr = selectAccountIdentity(state)
		const account = selectAccount(state)
		const { symbol, decimals, address: tokenAddress } = selectMainToken(state)
		const secret = generateMnemonic()
		const outputAmount = parseUnits(tokenAmount, decimals)
		const userBtcAddress = btcWallet.getAddress(1)

		const { btcContract, btcTxHash } = await initiateBtcToDaiSwap({
			btcWallet,
			inputAmount: btcAmount,
			outputAmount,
			sender: userBtcAddress,
			outputNetwork: symbol,
			secret,
			outputAddress: identityAddr,
		})
		await updateSpinner(btcTxHash, true)(dispatch)

		btcContract.subscribe(
			async event => {
				if (event.eventName === 'NEW_CONTRACT' && event.isSender) {
					onBtcContractCreated({
						event,
						secret,
						identityAddr,
						account,
						tokenAddress,
					})
				}
			},
			{
				new: {
					type: 'getSwapsByAddressAndBlock',
					address: userBtcAddress,
				},
			}
		)
	}
}
