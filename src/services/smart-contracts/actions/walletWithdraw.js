import { getAssets } from 'services/adex-wallet'
import { getEthers } from 'services/smart-contracts/ethers'
import { utils, BigNumber } from 'ethers'

import {
	ON_CHAIN_ACTIONS,
	getWalletIdentityTxnsWithNoncesAndFees,
	getWalletIdentityTxnsTotalFees,
	// getTxnsEstimationData,
	getTxnsBundleWithEstimatedFeesData,
	getBundleWithFeesTxnsAndFeesData,
	// processExecuteWalletTxns,
	// getWalletApproveTxns,
} from './walletIdentity'
import { formatTokenAmount } from 'helpers/formatters'
import { t } from 'selectors'
import { contracts } from 'services/smart-contracts/contractsCfg'

const { Interface, parseUnits } = utils
const ERC20 = new Interface(contracts.ERC20.abi)
const ZERO = BigNumber.from(0)

async function getWithdrawTxns({
	account,
	amountToWithdraw,
	amountToWithdrawAfterFeesCalcBN,
	withdrawTo,
	getFeesOnly,
	withdrawAssetAddr,
	// getMinAmountToSpend,
	tokenData,
	feeTokenAddr,
	// isFromETHToken,
	assetsDataRaw,
}) {
	const {
		//  wallet,
		identity,
	} = account
	// const { authType } = wallet
	// const {
	// 	provider,
	// 	IdentityPayable,
	// 	//   getToken
	// } = await getEthers(authType)
	const identityAddr = identity.address

	const assets = getAssets()
	const token = assets[withdrawAssetAddr]

	// const feeTokenAddr = feeTokenAddr || withdrawAssetAddr

	if (!tokenData) {
		throw new Error('walletWithdraw - invalid withdraw token address')
	}

	const amountToWithdrawBN = parseUnits(amountToWithdraw, token.decimals)

	const txns = []

	const amountToWithdrawFinal = getFeesOnly
		? // ? amountToWithdrawBN.sub(amountToUnwrap).toHexString()
		  amountToWithdrawBN
		: amountToWithdrawAfterFeesCalcBN

	const { isETH } = tokenData
	const withdrawTx = isETH
		? {
				identityContract: identityAddr,
				// feeTokenAddr,
				to: withdrawTo,
				data: '0x',
				value: amountToWithdrawFinal.toHexString(),
				onChainActionData: {
					txAction: {
						...ON_CHAIN_ACTIONS.transferETH({
							tokenData: token,
							amount: amountToWithdrawFinal,
							sender: `Identity (${identityAddr})`,
							recipient: `${withdrawTo}`,
						}),
					},
				},
		  }
		: {
				identityContract: identityAddr,
				// feeTokenAddr,
				to: withdrawAssetAddr,
				data: ERC20.encodeFunctionData('transfer', [
					withdrawTo,
					amountToWithdrawFinal.toHexString(),
				]),
				onChainActionData: {
					txAction: {
						...ON_CHAIN_ACTIONS.transferERC20({
							tokenData: token,
							amount: amountToWithdrawFinal,
							sender: `Identity (${identityAddr})`,
							recipient: `${withdrawTo}`,
						}),
					},
				},
		  }

	txns.push(withdrawTx)

	// const txnsWithNonceAndFees = await getWalletIdentityTxnsWithNoncesAndFees({
	// 	txns,
	// 	identityAddr,
	// 	provider,
	// 	Identity: IdentityPayable,
	// 	account,
	// 	feeTokenAddr,
	// })

	return {
		txns,
		// feeTokenAddr,
		// txnsWithNonceAndFees,
		amountToWithdrawBN,
		//  tradeData
	}
}

export async function walletWithdrawTransaction({
	account,
	amountToWithdraw,
	withdrawTo,
	withdrawAssetAddr, //: useInputWithdrawAsset,
	assetsDataRaw,
	getMinAmountToSpend,
	txSpeed,
	feeTokenAddr,
}) {
	const tokenData = assetsDataRaw[withdrawAssetAddr]

	// Pre call to get fees
	const {
		txns,
		// txnsWithNonceAndFees: _preTxnsWithNonceAndFees,
		// feeTokenAddr,
		amountToWithdrawBN: _preAmountToWithdrawBN,
	} = await getWithdrawTxns({
		account,
		amountToWithdraw,
		// amountToWithdrawAfterFeesCalcBN,
		withdrawTo,
		getFeesOnly: true,
		withdrawAssetAddr,
		tokenData,
		getMinAmountToSpend,
		assetsDataRaw,
		txSpeed,
		feeTokenAddr,
		// isFromETHToken,
	})

	const {
		estimatedData: preEstimatedData,
	} = await getTxnsBundleWithEstimatedFeesData({
		// account,
		txns,
		feeTokenAddr,
		txSpeed,
	})

	// const {
	// 	// success,
	// 	// gasLimit,
	// 	// gasPrice,
	// 	// feeInUSD,
	// 	// feeInFeeToken,
	// 	// actionMinAmountBN,
	// 	// actionMinAmountFormatted, // in ...rest
	// 	// ...rests
	// } = estimatedFeesData

	const totalFeesBN = preEstimatedData.feeInFeeToken[txSpeed]

	// TODO: unified function
	const mainActionAmountBN = _preAmountToWithdrawBN.sub(totalFeesBN)
	const mainActionAmountFormatted = formatTokenAmount(
		mainActionAmountBN,
		tokenData.decimals,
		false,
		tokenData.decimals
	)

	if (mainActionAmountBN.lt(ZERO)) {
		throw new Error(
			t('ERR_NO_BALANCE_FOR_FEES', {
				args: [tokenData.symbol, totalFeesBN],
			})
		)
	}

	// Actual call with fees pre calculated
	const {
		txns: txnsWithFee,
		amountToWithdrawBN,
		// txnsWithNonceAndFees: _preTxnsWithNonceAndFees,
	} = await getWithdrawTxns({
		account,
		amountToWithdraw,
		amountToWithdrawAfterFeesCalcBN: mainActionAmountBN,
		withdrawTo,
		getFeesOnly: false, // !!Important
		withdrawAssetAddr,
		tokenData,
		getMinAmountToSpend,
		assetsDataRaw,
		// isFromETHToken,
	})

	// NOTE: Use everywhere
	// amountToWithdraw - spend token user amount (mey be different for all funcs)
	// feesAmountBN - Get it form amountToWithdraw
	// totalAmountToSpendBN - total amount for the action + fees (amountToWithdrawBN)
	// mainActionAmountBN - amountToWithdraw.sub(feesAmountBN) - the actual amount to withdraw
	// !!!!! mainActionAmountBN - use tis amount when calling functions for signatures
	// actionMinAmountBN - should be more than 2x fees

	const {
		bundle,
		estimatedData,
		feeToken,
		txnsData,
	} = await getBundleWithFeesTxnsAndFeesData({
		// account,
		txns: txnsWithFee,
		feeTokenAddr,
		txSpeed,
		feeInFeeToken: preEstimatedData.feeInFeeToken,
	})

	return {
		bundle,
		estimatedData,
		feeToken,
		txnsData,
		feeTokenAddr,
		// estimatedFeesDataWithFees,
		// totalFeesBN,
		// totalFeesFormatted, // in rest,
		// actionMinAmountBN, // in ...rest
		// actionMinAmountFormatted, // in ...rest
		// spendTokenAddr: withdrawAssetAddr,
		totalAmountToSpendBN: amountToWithdrawBN, // Total amount out
		totalAmountToSpendFormatted: amountToWithdraw, // Total amount out
		mainActionAmountBN,
		mainActionAmountFormatted,
	}
}

async function getWithdrawMultipleTxns({
	account,
	withdrawAssets,
	feeTokenAddr,
	amountToWithdrawFeeTokenAfterFeesCalcBN,
	withdrawTo,
	getFeesOnly,
	assetsDataRaw,
}) {
	const { wallet, identity } = account
	const { authType } = wallet
	const {
		provider,
		IdentityPayable,
		//   getToken
	} = await getEthers(authType)
	const identityAddr = identity.address

	const txns = []

	let amountToWithdrawFeeAssetBN = null

	withdrawAssets.forEach(({ address, amount }) => {
		const token = assetsDataRaw[address]
		const { isETH, decimals } = token

		const amountToWithdrawBN = parseUnits(amount, decimals)

		if (address === feeTokenAddr) {
			amountToWithdrawFeeAssetBN = amountToWithdrawBN
		}

		const amountToWithdrawFinal = getFeesOnly
			? // ? amountToWithdrawBN.sub(amountToUnwrap).toHexString()
			  amountToWithdrawBN
			: amountToWithdrawFeeTokenAfterFeesCalcBN
		const tx = isETH
			? {
					identityContract: identityAddr,
					feeTokenAddr,
					to: withdrawTo,
					data: '0x',
					value: amountToWithdrawFinal.toHexString(),
					onChainActionData: {
						txAction: {
							...ON_CHAIN_ACTIONS.transferETH({
								tokenData: token,
								amount: amountToWithdrawFinal,
								sender: `Identity (${identityAddr})`,
								recipient: `${withdrawTo}`,
							}),
						},
					},
			  }
			: {
					identityContract: identityAddr,
					feeTokenAddr,
					to: address,
					data: ERC20.encodeFunctionData('transfer', [
						withdrawTo,
						amountToWithdrawFinal.toHexString(),
					]),
					onChainActionData: {
						txAction: {
							...ON_CHAIN_ACTIONS.transferERC20({
								tokenData: token,
								amount: amountToWithdrawFinal,
								sender: `Identity (${identityAddr})`,
								recipient: `${withdrawTo}`,
							}),
						},
					},
			  }
		txns.push(tx)
	})

	const txnsWithNonceAndFees = await getWalletIdentityTxnsWithNoncesAndFees({
		txns,
		identityAddr,
		provider,
		Identity: IdentityPayable,
		account,
		feeTokenAddr,
	})

	return {
		txnsWithNonceAndFees,
		amountToWithdrawFeeAssetBN,
		// amountToWithdrawBN,
		//  tradeData
	}
}

export async function walletWithdrawMultipleTransaction({
	account,
	// amountToWithdraw,
	withdrawTo,
	withdrawAssets,
	// withdrawAssetAddr, //: useInputWithdrawAsset,
	assetsDataRaw,
	getMinAmountToSpend,
	feeTokenAddr,
}) {
	// const isFromETHToken = isETHBasedToken({ address: useInputWithdrawAsset })

	// const withdrawAssetAddr = isFromETHToken
	// 	? tokens['ETH']
	// 	: useInputWithdrawAsset

	const tokenData = assetsDataRaw[feeTokenAddr]

	// Pre call to get fees
	const {
		txnsWithNonceAndFees: _preTxnsWithNonceAndFees,
		amountToWithdrawFeeAssetBN: _preAmountToWithdrawBN,
	} = await getWithdrawMultipleTxns({
		account,
		withdrawAssets,
		// amountToWithdrawAfterFeesCalcBN,
		withdrawTo,
		getFeesOnly: true,
		feeTokenAddr,
		// tokenData,
		assetsDataRaw,
		// isFromETHToken,
	})

	const {
		totalFeesBN: _preTotalFeesBN,
		totalFeesFormatted: _preTotalFeesFormatted,
	} = await getWalletIdentityTxnsTotalFees({
		txnsWithNonceAndFees: _preTxnsWithNonceAndFees,
	})

	// TODO: unified function
	const mainActionAmountBN = _preAmountToWithdrawBN.sub(_preTotalFeesBN)
	const mainActionAmountFormatted = formatTokenAmount(
		mainActionAmountBN,
		tokenData.decimals,
		false,
		tokenData.decimals
	)

	if (mainActionAmountBN.lt(ZERO)) {
		throw new Error(
			t('ERR_NO_BALANCE_FOR_FEES', {
				args: [tokenData.symbol, _preTotalFeesFormatted],
			})
		)
	}

	// Actual call with fees pre calculated
	const {
		txnsWithNonceAndFees,
		// amountToWithdrawFeeTokenBN,
	} = await getWithdrawMultipleTxns({
		account,
		withdrawAssets,
		amountToWithdrawFeeTokenAfterFeesCalcBN: mainActionAmountBN,
		withdrawTo,
		getFeesOnly: false, // !!Important
		feeTokenAddr,
		// tokenData,
		// getMinAmountToSpend,
		assetsDataRaw,
		// isFromETHToken,
	})

	const {
		totalFees,
		totalFeesBN,
		...rest
	} = await getWalletIdentityTxnsTotalFees({
		txnsWithNonceAndFees,
	})

	// NOTE: Use everywhere
	// amountToWithdraw - spend token user amount (mey be different for all funcs)
	// feesAmountBN - Get it form amountToWithdraw
	// totalAmountToSpendBN - total amount for the action + fees (amountToWithdrawBN)
	// mainActionAmountBN - amountToWithdraw.sub(feesAmountBN) - the actual amount to withdraw
	// !!!!! mainActionAmountBN - use tis amount when calling functions for signatures
	// actionMinAmountBN - should be more than 2x fees

	return {
		txnsWithNonceAndFees,
		totalFeesBN,
		// totalFeesFormatted, // in rest,
		// feeTokenAddr, //in ..rest
		// actionMinAmountBN, // in ...rest
		// actionMinAmountFormatted, // in ...rest
		spendTokenAddr: feeTokenAddr,
		totalAmountToSpendBN: _preAmountToWithdrawBN, // Total amount out
		totalAmountToSpendFormatted: utils.formatUnits(
			_preAmountToWithdrawBN,
			tokenData.decimals
		), // Total amount out for fee token address - kee it like work with validation
		mainActionAmountBN,
		mainActionAmountFormatted,
		...rest,
		actionMeta: {
			withdrawAssets,
		},
	}
}
