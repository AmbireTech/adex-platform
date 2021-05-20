import { assets, getPath, uniswapRouters } from 'services/adex-wallet'
import { getEthers } from 'services/smart-contracts/ethers'
import { BigNumber, utils } from 'ethers'
import { contracts } from 'services/smart-contracts/contractsCfg'
import {
	getIdentityTxnsTotalFees,
	processExecuteByFeeTokens,
	getIdentityTxnsWithNoncesAndFees,
	getApproveTxns,
} from 'services/smart-contracts/actions/identity'
import { selectMainToken } from 'selectors'
import { AUTH_TYPES, EXECUTE_ACTIONS } from 'constants/misc'

const { Interface } = utils

const ZapperInterface = new Interface(contracts.WalletZapper.abi)

export async function getTradeOutAmount({
	formAsset,
	formAssetAmount,
	toAsset,
}) {
	const { UniSwapRouterV2 } = await getEthers(AUTH_TYPES.READONLY)

	const { path, router } = await getPath({ from: formAsset, to: toAsset })

	const from = assets[formAsset]
	const to = assets[toAsset]

	const fromAmount = utils
		.parseUnits(formAssetAmount.toString(), from.decimals)
		.toHexString()

	if (router === 'uniV2') {
		const amountsOut = await UniSwapRouterV2.getAmountsOut(fromAmount, path)

		const amountOutParsed = utils.formatUnits(
			amountsOut[amountsOut.length - 1],
			to.decimals
		)

		return amountOutParsed
	}

	throw new Error('Invalid path')
}

export async function walletTradeTransaction({
	getFeesOnly,
	account,
	formAsset,
	formAssetAmount,
	toAsset,
	toAssetAmount,
}) {
	const { wallet, identity } = account
	const { authType } = wallet
	const { path, router } = await getPath({ from: formAsset, to: toAsset })

	const identityAddr = identity.address
	const { provider, WalletZapper, Identity, getToken } = await getEthers(
		authType
	)

	// TODO: use swap tokens for fees - update relayer
	// Add tokent to feeTokenWhitelist
	const mainToken = selectMainToken()

	const feeTokenAddr = mainToken.address

	const from = assets[formAsset]
	const to = assets[toAsset]

	const fromAmount = utils.parseUnits(formAssetAmount.toString(), from.decimals)
	const toAmount = utils.parseUnits(toAssetAmount.toString(), to.decimals)

	const txns = []

	// TODO: approve?

	if (router === 'uniV2') {
		const tradeTuple = [
			uniswapRouters.uniV2,
			fromAmount.toHexString(),
			toAmount.toHexString(),
			path,
			false,
		]

		const data = ZapperInterface.encodeFunctionData('exchangeV2', [
			[],
			[tradeTuple],
		])

		txns.push({
			identityContract: identityAddr,
			to: WalletZapper.address,
			feeTokenAddr,
			data,
		})
	}

	const txnsByFeeToken = await getIdentityTxnsWithNoncesAndFees({
		txns,
		identityAddr,
		provider,
		Identity,
		account,
		getToken,
		executeAction: EXECUTE_ACTIONS.default,
	})

	const { totalBN, breakdownFormatted } = await getIdentityTxnsTotalFees({
		txnsByFeeToken,
	})

	if (getFeesOnly) {
		return {
			feesAmountBN: totalBN,
			feeTokenAddr,
			spendTokenAddr: to.address,
			amountToSpendBN: fromAmount,
			breakdownFormatted,
		}
	}

	const result = await processExecuteByFeeTokens({
		identityAddr,
		txnsByFeeToken,
		wallet,
		provider,
	})

	return {
		result,
	}
	// TODO: ..
}
