import { generateMnemonic } from 'bip39'
import { parseUnits } from 'ethers/utils'

import {
	selectMainToken,
	t,
	selectAccountIdentity,
	selectAccount,
} from 'selectors'
import { initiateBtcToDaiSwap, erc20SwapWithdraw } from 'services/jellyswap'

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

		// TODO: store the secret and the btc tx hash in encrypted storage by user
		// TODO: subscribe and get the id

		const { erc20Contract, result } = await erc20SwapWithdraw({
			// id, // Id from NEW_CONTRACT contract event result
			identityAddr,
			account,
			secret,
			tokenAddress,
		})
	}
}
