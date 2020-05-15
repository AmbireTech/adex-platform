import { Interface } from 'ethers/utils'
import { getEthers } from 'services/smart-contracts/ethers'
import {
	getIdentityTxnsWithNoncesAndFees,
	processExecuteByFeeTokens,
} from 'services/smart-contracts/actions/identity'
import { Contract } from '@jelly-swap/erc20'
import Erc20SwapAbi from '@jelly-swap/erc20/dist/config/abi'
import { DAI_CONFIG } from './config'

const ERC20Swap = new Interface(Erc20SwapAbi)

const config = DAI_CONFIG()

export const erc20SwapWithdraw = async ({
	identityAddr,
	account,
	id, // Id from NEW_CONTRACT contract event result
	secret,
	mainTokenAddr,
}) => {
	const { wallet } = account
	const { provider, getToken, Identity } = await getEthers(wallet.authType)

	// NOTE: We Do not need this account but just in case for the testing
	const erc20Contract = new Contract(provider, config)
	const txData = ERC20Swap.functions.withdraw([id, secret, mainTokenAddr])

	const withdrawTx = {
		identityContract: identityAddr,
		feeTokenAddr: mainTokenAddr,
		to: config.contractAddress, // JELLYSWAPSWAP ERC20 contract addr,
		data: txData,
	}

	const txns = [withdrawTx]

	const txnsByFeeToken = await getIdentityTxnsWithNoncesAndFees({
		txns,
		identityAddr,
		provider,
		Identity,
		account,
		getToken,
	})

	const result = await processExecuteByFeeTokens({
		identityAddr,
		txnsByFeeToken,
		wallet,
		provider,
	})

	// We are not going to track the txns in the dapp, just other transactions
	// - etherscan + auto update

	return { result, erc20Contract }
}
