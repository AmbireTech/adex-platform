import { assets, getPath, uniswapRouters } from 'services/adex-wallet'
import { getEthers } from 'services/smart-contracts/ethers'
import { BigNumber, utils } from 'ethers'
import { contracts } from 'services/smart-contracts/contractsCfg'
import {
	getIdentityTxnsWithNoncesAndFees,
	getIdentityTxnsTotalFees,
	processExecuteByFeeTokens,
	getApproveTxns,
} from 'services/smart-contracts/actions/identity'
import { selectMainToken } from 'selectors'
import { AUTH_TYPES, EXECUTE_ACTIONS } from 'constants/misc'

const { Interface } = utils

const ZapperInterface = new Interface(contracts.WalletZapper.abi)

export async function walletTradeTransaction({
	getFeesOnly,
	account,
	authType,
	formAsset,
	formAssetAmount,
	toAsset,
	toAssetAmount,
}) {
	const { wallet, identity } = account
	const { path, router } = await getPath({ from: formAsset, to: toAsset })

	const identityAddr = identity.address
	const { provider, WalletZapper, Identity, getToken } = await getEthers(
		authType
	)

	// TODO: use swap tokens for fees - update relayer
	const mainToken = selectMainToken()

	const from = assets[formAsset]
	const to = assets[toAsset]

	const fromAmount = utils.parseUnits(formAssetAmount, from.decimals)
	const toAmount = utils.parseUnits(toAssetAmount, to.decimals)

	const txns = []
	if (router === 'uniV2') {
		const tradeTuple = [
			uniswapRouters.uniV2,
			`0x${fromAmount.toString(16)}`,
			`0x${toAmount.toString(16)}`,
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
			feeTokenAddr: mainToken.address,
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

	const { total, totalBN, breakdownFormatted } = await getIdentityTxnsTotalFees(
		{ txnsByFeeToken }
	)

	if (getFeesOnly) {
		return {
			feesFormatted: total,
			fees: totalBN,
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
