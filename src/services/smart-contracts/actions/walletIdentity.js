import { Contract, BigNumber, utils, constants } from 'ethers'
import { tokens, assets } from 'services/adex-wallet'
import { formatTokenAmount } from 'helpers/formatters'
import {
	getSigner,
	getMultipleTxSignatures,
} from 'services/smart-contracts/actions/ethers'
import { getAAVEInterestToken } from 'services/smart-contracts/actions/walletCommon'
import { executeTx } from 'services/adex-relayer'
import ERC20TokenABI from 'services/smart-contracts/abi/ERC20Token'
import { selectRelayerConfig } from 'selectors'
const { parseUnits, formatUnits, Interface } = utils
const { MaxInt256 } = constants

const ERC20 = new Interface(ERC20TokenABI)

const ZERO = BigNumber.from('0')

export const GAS_LIMITS = {
	transfer: BigNumber.from(50_000), // to identity, to relayer (fee transfer), withdraw
	swapV2: BigNumber.from(110_000), // each
	swapV3: BigNumber.from(110_000), // each
	wrap: BigNumber.from(180_000), // each
	unwrap: BigNumber.from(180_000), // each
	deploy: BigNumber.from(120_000),
	base: BigNumber.from(30_000), // Base for each identity tx
	approve: BigNumber.from(70_000),
}

const transferERC20 = ({
	tokenData = {},
	tokenNamePrefix,
	amount,
	sender,
	recipient,
	...extra
}) => ({
	contract: 'ERC20',
	method: 'transfer',
	name: 'SC_ACTION_TRANSFER_ERC20',
	gasCost: GAS_LIMITS.transfer,
	token: `${tokenNamePrefix ? tokenNamePrefix + ' ' : ''}${tokenData.symbol} (${
		tokenData.address
	})`,
	amount: formatTokenAmount(amount, tokenData.decimals),
	sender,
	recipient,
	...extra,
})

const depositAAVE = ({ tokenData, recipient, minOut }) => {
	const interestTokenData = getAAVEInterestToken({
		underlyingAssetAddr: tokenData.address,
	})
	return {
		contract: 'IAaveLendingPool',
		method: 'deposit',
		name: 'SC_ACTION_AAVE_DEPOSIT',
		gasCost: GAS_LIMITS.wrap,
		recipient,
		underlingToken: `${tokenData.symbol} (${tokenData.address})`,
		aaveInterestToken: `${interestTokenData.symbol} (${
			getAAVEInterestToken({
				underlyingAssetAddr: tokenData.address,
			}).address
		})`,
		minOut: formatTokenAmount(minOut, tokenData.decimals),
	}
}
const withdrawAAVE = ({ aaveInterestToken, aaveUnwrapAmount }) => ({
	contract: 'IAaveLendingPool',
	method: 'withdraw',
	name: 'SC_ACTION_AAVE_WITHDRAW',
	gasCost: GAS_LIMITS.unwrap,
	token: `${aaveInterestToken.symbol} (${aaveInterestToken.address})`,
	amount: formatTokenAmount(aaveUnwrapAmount, aaveInterestToken.decimals),
})

const swapInnerUniV2 = (path = []) => ({
	contract: 'IUniswapSimple',
	method: 'swapExactTokensForTokens',
	name: 'SC_ACTION_SWAP_UNI_V2_DIRECT',
	gasCost: GAS_LIMITS.swapV2.mul(path.length - 1),
	path,
	swaps: path.length - 1,
})

const zapperExchangeV2 = ({
	assetsToUnwrap = [],
	path,
	inputTokenData,
	outputTokenData,
	lendOutputToAAVE,
	recipient,
	minOut,
	fromAmount,
}) => ({
	contract: 'Zapper',
	method: 'exchangeV2',
	name: 'SC_ACTION_ZAPPER_EXCHANGE_V2',
	fromAmount: formatTokenAmount(fromAmount, inputTokenData.decimals),
	minOut: formatTokenAmount(minOut, outputTokenData.decimals),
	txInnerActions: [
		...assetsToUnwrap.map(({ aaveInterestToken, aaveUnwrapAmount }) =>
			withdrawAAVE({ aaveInterestToken, aaveUnwrapAmount })
		),
		...[swapInnerUniV2(path)],
		...(lendOutputToAAVE
			? [depositAAVE({ tokenData: outputTokenData, recipient, minOut })]
			: []),
	],
})

const swapInnerUniV3Single = ({
	inputTokenData,
	outputTokenData,
	fromAmount,
	minOut,
	recipient,
}) => ({
	contract: 'uniV3Router',
	method: 'exactInputSingle',
	name: 'SC_ACTION_SWAP_UNI_V3_SINGLE',
	gasCost: GAS_LIMITS.swapV3,
	path: [inputTokenData.symbol, outputTokenData.symbol],
	swaps: 1,
	...(fromAmount && {
		fromAmount: formatTokenAmount(fromAmount, inputTokenData.decimals),
	}),
	...(minOut && {
		minOut: formatTokenAmount(minOut, outputTokenData.decimals),
	}),
	...(recipient && { recipient }),
})

const zapperTradeV3Single = ({
	inputTokenData,
	outputTokenData,
	lendOutputToAAVE,
	recipient,
	minOut,
	fromAmount,
}) => {
	return {
		contract: 'Zapper',
		method: 'tradeV3Single',
		name: 'SC_ACTION_ZAPPER_EXCHANGE_V3_SINGLE',
		fromAmount: formatTokenAmount(fromAmount, inputTokenData.decimals),
		minOut: formatTokenAmount(minOut, outputTokenData.decimals),
		recipient,
		txInnerActions: [
			...[swapInnerUniV3Single({ inputTokenData, outputTokenData })],
			...(lendOutputToAAVE
				? [depositAAVE({ tokenData: outputTokenData, recipient, minOut })]
				: []),
		],
	}
}

const swapInnerUniV3 = ({ path }) => ({
	contract: 'uniV3Router',
	method: 'exactInput',
	name: 'SC_ACTION_SWAP_UNI_V3',
	gasCost: GAS_LIMITS.swapV2.mul(path.length - 1),
	path,
	swaps: path.length - 1,
})

const zapperTradeV3 = ({
	inputTokenData,
	outputTokenData,
	recipient,
	minOut,
	fromAmount,
	path,
}) => {
	return {
		contract: 'Zapper',
		method: 'tradeV3',
		name: 'SC_ACTION_ZAPPER_EXCHANGE_V3',
		fromAmount: formatTokenAmount(fromAmount, inputTokenData.decimals),
		minOut: formatTokenAmount(minOut, outputTokenData.decimals),
		txInnerActions: [...[swapInnerUniV3({ path })]],
		recipient,
	}
}

const zapperDiversifyV3 = ({
	inputTokenData,
	recipient,
	fromAmount,
	txInnerActions, // TODO: get the data here
}) => {
	return {
		contract: 'Zapper',
		method: 'diversifyV3',
		name: 'SC_ACTION_ZAPPER_DIVERSIFYv3',
		fromAmount: formatTokenAmount(fromAmount, inputTokenData.decimals),
		recipient,
		txInnerActions,
	}
}

export const ON_CHAIN_ACTIONS = {
	transferERC20,
	swapInnerUniV2,
	zapperExchangeV2,
	zapperTradeV3Single,
	zapperTradeV3,
	swapInnerUniV3Single,
	depositAAVE,
	zapperDiversifyV3,
	zapperDiversifyInnerExchange: {
		name: 'SC_ACTION_ZAPPER_EXCHANGE_INNER',
		gasCost: GAS_LIMITS.swapV3,
	},
	swapUniV3Single: {
		name: 'SC_ACTION_SWAP_UNI_V3_DIRECT',
		gasCost: GAS_LIMITS.swapV3,
	},
	swapUniV3MultiHop: {
		name: 'SC_ACTION_SWAP_UNI_V3_MULTIHOP',
		gasCost: GAS_LIMITS.swapV3,
	},
	swapUniV3MultiHopSingle: {
		name: 'SC_ACTION_SWAP_UNI_V3_MULTIHOP_SINGLE',
		gasCost: GAS_LIMITS.swapV3,
	},
	withdrawAAVE: {
		name: 'SC_ACTION_AAVE_WITHDRAW',
		gasCost: GAS_LIMITS.unwrap,
	},
	approve: {
		name: 'SC_ACTION_APPROVE',
		gasCost: GAS_LIMITS.approve,
	},
	deploy: {
		name: 'SC_ACTION_IDENTITY_DEPLOY',
		gasCost: GAS_LIMITS.deploy,
	},
	depositWETH: {
		name: 'SC_ACTION_WETH_DEPOSIT',
		gasCost: GAS_LIMITS.wrap,
	},
	withdrawWETH: {
		name: 'SC_ACTION_WETH_WITHDRAW',
		gasCost: GAS_LIMITS.unwrap,
	},
	feeTransfer: {
		name: 'SC_ACTION_FEE_TRANSFER',
		gasCost: GAS_LIMITS.transfer,
	},
}

// Calc nonces and
export async function getWalletIdentityTxnsWithNoncesAndFees({
	txns = [],
	identityAddr,
	provider,
	Identity,
	account,
	feeTokenAddr,
}) {
	const { gasPriceRatio = 1.07, gasPriceCap } = selectRelayerConfig()
	const allSameFeeToken = txns.every(x => x.feeTokenAddr === feeTokenAddr)

	if (!allSameFeeToken) {
		throw new Error('TXNS_FEES_NOT_SAME_FEE_TOKEN')
	}

	let isDeployed = (await provider.getCode(identityAddr)) !== '0x'
	let identityContract = null

	if (isDeployed) {
		identityContract = new Contract(identityAddr, Identity.abi, provider)
	}

	const initialNonce = isDeployed
		? (await identityContract.nonce()).toNumber()
		: 0

	let currentNonce = initialNonce
	const feeToken = assets[feeTokenAddr]

	// TODO: move it from account
	const { prices } = account.stats

	const networkGasPrice = await provider.getGasPrice()

	const gasPrice = Math.min(
		gasPriceCap,
		Math.floor(networkGasPrice * gasPriceRatio)
	)

	const feeTokenAddrUSDPrice =
		prices[feeToken.mainAssetSymbol || feeToken.symbol]['USD']

	const withNonceAndFees = txns.map((tx, txIndex) => {
		const { onChainActionData = {} } = tx
		// const feeToken = feeTokenWhitelist[tx.feeTokenAddr]
		const isDeployTx = currentNonce === 0
		const addFeeTx = txIndex === txns.length - 1

		const { txAction = {}, txInnerActions = [] } = onChainActionData

		if (!txAction.name) {
			throw new Error('txAction.name not provided')
		}

		// TODO: use only txAction.txInnerActions when ready
		const allTxInnerActions = [
			...txInnerActions,
			...(txAction.txInnerActions || []),
		]
		const txGasCost = BigNumber.from(txAction.gasCost || '0')
		const innerActionsTGasCost = allTxInnerActions.reduce(
			(total, actionData) => {
				if (!actionData.name) {
					throw new Error('actionData.name not provided')
				}
				return total.add(actionData.gasCost || '0')
			},
			ZERO
		)

		const txnsData = [{ txAction, txInnerActions: allTxInnerActions }]
		if (isDeployTx) {
			txnsData.push({ txAction: { ...ON_CHAIN_ACTIONS.deploy } })
		}

		if (addFeeTx) {
			txnsData.push({ txAction: { ...ON_CHAIN_ACTIONS.feeTransfer } })
		}

		const operationsGasLimitSumBN = txGasCost.add(innerActionsTGasCost)

		const txEstimatedGasLimitBN = operationsGasLimitSumBN
			.add(isDeployTx ? GAS_LIMITS.deploy : ZERO)
			// Add fee transfer fee
			.add(addFeeTx ? GAS_LIMITS.transfer : ZERO)

		const calculatedOperationsCount =
			allTxInnerActions.length +
			txInnerActions.length +
			(isDeployTx ? 1 : 0) +
			(addFeeTx ? 1 : 0)

		const txFeeAmountETH = parseFloat(
			formatUnits(
				txEstimatedGasLimitBN.mul(gasPrice),
				assets[tokens['WETH']].decimals
			)
		)

		// TODO: BN
		const txFeeAmountUSD = txFeeAmountETH * prices['WETH']['USD']
		const txFeeAmountFeeToken = parseUnits(
			(txFeeAmountUSD / feeTokenAddrUSDPrice).toFixed(feeToken.decimals),
			feeToken.decimals
		)

		// Total relayer fees for the transaction
		const feeAmount = txFeeAmountFeeToken.toString()

		const txWithNonce = {
			...tx,
			feeTokenAddr,
			feeAmount,
			txEstimatedGasLimitBN,
			calculatedGasPriceBN: gasPrice,
			calculatedOperationsCount,
			txnsData,
			nonce: currentNonce,
			isDeployTx,
		}

		currentNonce += 1

		return txWithNonce
	})

	return withNonceAndFees
}

export async function getWalletIdentityTxnsTotalFees({ txnsWithNonceAndFees }) {
	const { feeTokenAddr } = txnsWithNonceAndFees[0]
	const feeToken = assets[feeTokenAddr]

	const {
		totalFeesBN,
		txnsCount,
		hasDeployTx,
		totalEstimatedGasLimitBN,
		calculatedGasPriceBN,
		calculatedOperationsCount,
		txnsData,
	} = txnsWithNonceAndFees.reduce(
		(result, tx) => {
			const {
				feeAmount,
				isDeployTx,
				txEstimatedGasLimitBN,
				calculatedOperationsCount,
				calculatedGasPriceBN,
				txnsData,
			} = tx

			const {
				totalFeesBN,
				txnsCount,
				hasDeployTx,
				totalEstimatedGasLimitBN,
			} = result
			result.totalFeesBN = totalFeesBN.add(feeAmount)
			result.txnsCount = txnsCount + 1
			result.hasDeployTx = hasDeployTx || isDeployTx
			result.totalEstimatedGasLimitBN = totalEstimatedGasLimitBN.add(
				txEstimatedGasLimitBN
			)
			// It's the same for all txns
			result.calculatedGasPriceBN =
				result.calculatedGasPriceBN || calculatedGasPriceBN
			result.calculatedOperationsCount =
				result.calculatedOperationsCount + calculatedOperationsCount
			result.txnsData.push(...txnsData)

			return result
		},
		{
			hasDeployTx: false,
			totalFeesBN: ZERO,
			txnsCount: 0,
			totalEstimatedGasLimitBN: ZERO,
			calculatedGasPriceBN: null,
			calculatedOperationsCount: 0,
			txnsData: [],
		}
	)

	console.log('calculatedGasPriceBN', calculatedGasPriceBN.toString())
	console.log(
		'calculatedGasPriceGWEI',
		formatUnits(calculatedGasPriceBN, 'gwei')
	)

	const actionMinAmountBN = totalFeesBN.mul(1)

	const txnsDataFormatted = txnsData.map(
		({ txAction, txInnerActions = [] }) => ({
			txAction: {
				...txAction,
				gasCost: BigNumber.from(txAction.gasCost || '0').toString(),
			},
			txInnerActions: txInnerActions.map(inner => ({
				...inner,
				gasCost: BigNumber.from(inner.gasCost || '0').toString(),
			})),
		})
	)

	const fees = {
		totalFeesFormatted: formatTokenAmount(
			totalFeesBN,
			feeToken.decimals,
			false,
			feeToken.decimals
		),
		totalFeesBN,
		txnsCount,
		hasDeployTx,
		feeTokenAddr,
		feeTokenSymbol: feeToken.symbol,
		feeTokenDecimals: feeToken.decimals,
		actionMinAmountBN,
		actionMinAmountFormatted: formatTokenAmount(
			actionMinAmountBN,
			feeToken.decimals,
			false,
			feeToken.decimals
		),
		totalEstimatedGasLimitBN,
		totalEstimatedGasLimitFormatted: totalEstimatedGasLimitBN.toString(),
		calculatedGasPriceBN,
		calculatedGasPriceGWEI: formatUnits(
			calculatedGasPriceBN.toString(),
			'gwei'
		),
		calculatedOperationsCount,
		txnsData: txnsDataFormatted,
	}

	return fees
}

export async function processExecuteWalletTxns({
	txnsWithNonceAndFees,
	wallet,
	provider,
	identityAddr,
	extraData = {},
}) {
	// console.log('txnsWithNonceAndFees', txnsWithNonceAndFees)
	const signer = await getSigner({ wallet, provider })
	const signatures = await getMultipleTxSignatures({
		txns: txnsWithNonceAndFees,
		signer,
	})
	const data = {
		txnsRaw: txnsWithNonceAndFees,
		signatures,
		identityAddr,
		...extraData,
	}

	if (
		process.env.BUILD_TYPE === 'staging' ||
		process.env.NODE_ENV === 'development'
	) {
		console.log('data', JSON.stringify(data, null, 2))
	}

	const result = await executeTx(data)

	return {
		result,
	}
}

export async function getWalletApproveTxns({
	provider,
	tokenAddress,
	identityAddr,
	feeTokenAddr,
	approveForAddress,
	approveAmount = MaxInt256,
}) {
	const tokenContract = new Contract(tokenAddress, ERC20TokenABI, provider)

	const allowance = await tokenContract.allowance(
		identityAddr,
		approveForAddress
	)

	const approveTxns = []

	if (!allowance.isZero()) {
		approveTxns.push({
			identityContract: identityAddr,
			feeTokenAddr,
			to: tokenAddress,
			data: ERC20.encodeFunctionData('approve', [approveForAddress, 0]),
			operationsGasLimits: [GAS_LIMITS.approve],
		})
	}

	approveTxns.push({
		identityContract: identityAddr,
		feeTokenAddr,
		to: tokenAddress,
		data: ERC20.encodeFunctionData('approve', [
			approveForAddress,
			approveAmount,
		]),
		operationsGasLimits: [GAS_LIMITS.approve],
	})

	return approveTxns
}
