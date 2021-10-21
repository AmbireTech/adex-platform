import { Contract, BigNumber, utils, constants } from 'ethers'
import { getTokens, getAssets } from 'services/adex-wallet'
import { formatTokenAmount } from 'helpers/formatters'
import {
	getSigner,
	getMultipleTxSignatures,
} from 'services/smart-contracts/actions/ethers'
import { getAAVEInterestToken } from 'services/smart-contracts/actions/walletCommon'
import { executeTx } from 'services/adex-relayer'
import ERC20TokenABI from 'services/smart-contracts/abi/ERC20Token'
import { Bundle, signMsgHash } from 'adex-protocol-eth/js/Bundle'
import {
	// getEthers,
	getEthersReadOnly,
} from 'services/smart-contracts/ethers'
import {
	t,
	selectRelayerConfig,
	selectAccountIdentityAddr,
	selectAssetsPrices,
	selectNetwork,
	selectWalletAddress,
} from 'selectors'
const { parseUnits, formatUnits, Interface } = utils
const { MaxInt256 } = constants

const ADEX_RELAYER_HOST = process.env.ADEX_RELAYER_HOST

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
	transferETH: BigNumber.from(21_000),
}

const getTokenAmount = ({ amount, tokenData }) => {
	if (typeof amount === 'string') {
		try {
			return formatTokenAmount(amount, tokenData.decimals)
		} catch {
			return amount.toString()
		}
	} else {
		return formatTokenAmount(amount, tokenData.decimals)
	}
}

const transferETH = ({
	tokenData = {},
	amount,
	sender,
	recipient,
	relayerFeeTx,
	...extra
}) => ({
	contract: 'identity',
	method: 'value',
	name: relayerFeeTx
		? 'SC_ACTION_TRANSFER_ETH_RELAYER_FEE'
		: 'SC_ACTION_TRANSFER_ETH',
	// gasCost: GAS_LIMITS.transferETH,
	amount: getTokenAmount({ amount, tokenData }),
	sender,
	recipient,
	...extra,
})

const transferERC20 = ({
	tokenData = {},
	tokenNamePrefix,
	amount,
	sender,
	recipient,
	relayerFeeTx,
	...extra
}) => ({
	contract: 'ERC20',
	method: 'transfer',
	name: relayerFeeTx
		? 'SC_ACTION_TRANSFER_ERC20_RELAYER_FEE'
		: 'SC_ACTION_TRANSFER_ERC20',
	// gasCost: GAS_LIMITS.transfer,
	token: `${tokenNamePrefix ? tokenNamePrefix + ' ' : ''}${tokenData.symbol} (${
		tokenData.address
	})`,
	amount: getTokenAmount({ amount, tokenData }),
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
		// gasCost: GAS_LIMITS.wrap,
		recipient,
		underlingToken: `${tokenData.symbol} (${tokenData.address})`,
		aaveInterestToken: `${interestTokenData.symbol} (${
			getAAVEInterestToken({
				underlyingAssetAddr: tokenData.address,
			}).address
		})`,
		minOut: getTokenAmount({ amount: minOut, tokenData }),
	}
}
const withdrawAAVE = ({ underlyingToken, aaveUnwrapAmount }) => ({
	contract: 'IAaveLendingPool',
	method: 'withdraw',
	name: 'SC_ACTION_AAVE_WITHDRAW',
	// gasCost: GAS_LIMITS.unwrap,
	token: `${underlyingToken.symbol} (${underlyingToken.address})`,
	amount: getTokenAmount({
		amount: aaveUnwrapAmount,
		tokenData: underlyingToken,
	}),
})

const swapInnerUniV2 = (path = []) => ({
	contract: 'IUniswapSimple',
	method: 'swapExactTokensForTokens',
	name: 'SC_ACTION_SWAP_UNI_V2_DIRECT',
	// gasCost: GAS_LIMITS.swapV2.mul(path.length - 1),
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
	fromAmount: getTokenAmount({ amount: fromAmount, tokenData: inputTokenData }),
	minOut: getTokenAmount({ amount: minOut, tokenData: outputTokenData }),
	txInnerActions: [
		...assetsToUnwrap.map(
			({ underlyingToken, aaveInterestToken, aaveUnwrapAmount }) =>
				withdrawAAVE({ underlyingToken, aaveUnwrapAmount })
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
		fromAmount: getTokenAmount({
			amount: fromAmount,
			tokenData: inputTokenData,
		}),
	}),
	...(minOut && {
		minOut: getTokenAmount({ amount: minOut, tokenData: outputTokenData }),
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
		fromToken: `${inputTokenData.symbol} (${inputTokenData.address})`,
		fromAmount: getTokenAmount({
			amount: fromAmount,
			tokenData: inputTokenData,
		}),
		minOut: getTokenAmount({ amount: minOut, tokenData: outputTokenData }),
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
	// gasCost: GAS_LIMITS.swapV2.mul(path.length - 1),
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
		fromAmount: getTokenAmount({
			amount: fromAmount,
			tokenData: inputTokenData,
		}),
		minOut: getTokenAmount({ amount: minOut, tokenData: outputTokenData }),
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
		fromAmount: getTokenAmount({
			amount: fromAmount,
			tokenData: inputTokenData,
		}),
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
	withdrawAAVE,
	transferETH,
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
	approve: {
		name: 'SC_ACTION_APPROVE',
		gasCost: GAS_LIMITS.approve,
	},
	deploy: {
		name: 'SC_ACTION_IDENTITY_DEPLOY',
		gasCost: GAS_LIMITS.deploy,
	},
	depositWETH: ({ amount }) => {
		const assets = getAssets()
		const tokens = getTokens()
		return {
			contract: 'WETH',
			method: 'deposit',
			name: 'SC_ACTION_WETH_DEPOSIT',
			amount: getTokenAmount({ amount, tokenData: assets[tokens.WETH] }),
			// gasCost: GAS_LIMITS.wrap,
		}
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

function getOperationsGasLimitSumBN(txnsData) {
	return txnsData.reduce((total, { txAction, txInnerActions = [] }) => {
		const txGasCost = BigNumber.from(txAction.gasCost || '0')
		const innerActionsTGasCost = txInnerActions.reduce((total, actionData) => {
			if (!actionData.name) {
				throw new Error('actionData.name not provided')
			}
			return total.add(actionData.gasCost || '0')
		}, ZERO)

		return total.add(txGasCost).add(innerActionsTGasCost)
	}, ZERO)
}
function mapWithFeeAndNonce({
	txns,
	currentNonce,
	gasPrice,
	feeTokenAddr,
	prices,
	feeToken,
	feeTokenAddrUSDPrice,
}) {
	let nonce = currentNonce
	const withNonceAndFees = txns.map((tx, txIndex) => {
		const { onChainActionData } = tx
		if (!onChainActionData || typeof onChainActionData !== 'object') {
			throw new Error('onChainActionData not provided')
		}

		const isDeployTx = nonce === 0

		const { txAction = {}, txInnerActions = [] } = onChainActionData

		if (!txAction.name) {
			throw new Error('txAction.name not provided')
		}

		// TODO: use only txAction.txInnerActions when ready
		const allTxInnerActions = [
			...txInnerActions,
			...(txAction.txInnerActions || []),
		]

		const txnsData = [{ txAction, txInnerActions: allTxInnerActions }]
		if (isDeployTx) {
			// TODO full operationData for deploy
			txnsData.push({ txAction: { ...ON_CHAIN_ACTIONS.deploy } })
		}

		const txEstimatedGasLimitBN = getOperationsGasLimitSumBN(txnsData)
		const calculatedOperationsCount =
			allTxInnerActions.length + txInnerActions.length + (isDeployTx ? 1 : 0) //+

		// const assets = getAssets()
		// const tokens = getTokens()
		const txFeeAmountETH = parseFloat(
			formatUnits(
				txEstimatedGasLimitBN.mul(gasPrice),
				// assets[tokens['WETH']].decimals
				18
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
			nonce,
			isDeployTx,
		}

		nonce += 1

		return txWithNonce
	})

	return { withNonceAndFees, nonce }
}
// Calc nonces and
export async function getWalletIdentityTxnsWithNoncesAndFees({
	txns = [],
	identityAddr,
	provider,
	Identity,
	feeTokenAddr,
	// simulatedFeeAmount,
}) {
	const {
		gasPriceRatio = 1.07,
		gasPriceCap,
		// relayerAddr,
	} = selectRelayerConfig()

	console.log('txns', txns)
	// const allSameFeeToken = txns.every(x => x.feeTokenAddr === feeTokenAddr)

	// if (!allSameFeeToken) {
	// 	throw new Error('TXNS_FEES_NOT_SAME_FEE_TOKEN')
	// }

	let isDeployed = (await provider.getCode(identityAddr)) !== '0x'
	let identityContract = null

	if (isDeployed) {
		identityContract = new Contract(identityAddr, Identity.abi, provider)
	}

	const initialNonce = isDeployed
		? (await identityContract.nonce()).toNumber()
		: 0

	let currentNonce = initialNonce
	const assets = getAssets()
	const feeToken = assets[feeTokenAddr]

	const prices = selectAssetsPrices()

	const networkGasPrice = await provider.getGasPrice()

	const gasPrice = Math.min(
		gasPriceCap,
		Math.floor(networkGasPrice * gasPriceRatio)
	)

	const feeTokenAddrUSDPrice =
		prices[feeToken.mainAssetSymbol || feeToken.symbol]['USD']

	const { withNonceAndFees, nonce } = mapWithFeeAndNonce({
		txns,
		currentNonce,
		gasPrice,
		feeTokenAddr,
		prices,
		feeToken,
		feeTokenAddrUSDPrice,
	})

	// We will ha

	// const feeTxGasCost = (feeToken.isETH
	// 	? ON_CHAIN_ACTIONS.transferETH({
	// 			tokenData: feeToken,
	// 	  })
	// 	: ON_CHAIN_ACTIONS.transferERC20({
	// 			tokenData: feeToken,
	// 	  })
	// ).gasCost

	// const txnsFEES = withNonceAndFees.reduce((sum, { txEstimatedGasLimitBN }) => {
	// 	return sum.add(txEstimatedGasLimitBN)
	// }, feeTxGasCost)

	// // NOTE: add fee tx
	// const feeTx = feeToken.isETH
	// 	? {
	// 			identityContract: identityAddr,
	// 			// feeTokenAddr,
	// 			to: relayerAddr,
	// 			data: '0x',
	// 			value: txnsFEES.toHexString(),
	// 			onChainActionData: {
	// 				txAction: {
	// 					...ON_CHAIN_ACTIONS.transferETH({
	// 						tokenData: feeToken,
	// 						amount: txnsFEES,
	// 						sender: `Identity (${identityAddr})`,
	// 						recipient: `Relayer ${relayerAddr}`,
	// 						relayerFeeTx: true,
	// 					}),
	// 				},
	// 			},
	// 	  }
	// 	: {
	// 			identityContract: identityAddr,
	// 			// feeTokenAddr,
	// 			to: feeTokenAddr,
	// 			data: ERC20.encodeFunctionData('transfer', [
	// 				relayerAddr,
	// 				txnsFEES.toHexString(),
	// 			]),
	// 			onChainActionData: {
	// 				txAction: {
	// 					...ON_CHAIN_ACTIONS.transferERC20({
	// 						tokenData: feeToken,
	// 						amount: txnsFEES,
	// 						sender: `Identity (${identityAddr})`,
	// 						recipient: `Relayer ${relayerAddr}`,
	// 						relayerFeeTx: true,
	// 					}),
	// 				},
	// 			},
	// 	  }

	// const { withNonceAndFees: feeTxWithNonceAndFeesData } = mapWithFeeAndNonce({
	// 	txns: [feeTx],
	// 	currentNonce: nonce,
	// 	gasPrice,
	// 	feeTokenAddr,
	// 	prices,
	// 	feeToken,
	// 	feeTokenAddrUSDPrice,
	// })

	// withNonceAndFees.push(...feeTxWithNonceAndFeesData)

	// console.log('withNonceAndFees', withNonceAndFees)
	return withNonceAndFees
}

export async function getWalletIdentityTxnsTotalFees({ txnsWithNonceAndFees }) {
	const { feeTokenAddr } = txnsWithNonceAndFees[0]
	const assets = getAssets()
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
				isDeployTx,
				calculatedOperationsCount,
				calculatedGasPriceBN,
				txnsData,
			} = tx

			const { txnsCount, hasDeployTx } = result
			result.txnsCount = txnsCount + 1
			result.hasDeployTx = hasDeployTx || isDeployTx
			// It's the same for all txns
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

	// const actionMinAmountBN = totalFeesBN.mul(1)

	const txnsDataFormatted = txnsData.map(({ txAction }) => ({
		txAction: {
			...txAction,
			txInnerActions: (txAction.txInnerActions || []).map(inner => ({
				...inner,
				gasCost: BigNumber.from(inner.gasCost || '0').toString(),
			})),
		},
	}))

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
		// actionMinAmountBN,
		// actionMinAmountFormatted: formatTokenAmount(
		// 	actionMinAmountBN,
		// 	feeToken.decimals,
		// 	false,
		// 	feeToken.decimals
		// ),
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

	// NOTE: identity  v5.2 will not have feeAmount
	// TEMP: used for total fee calc until updated relayer integration
	const noFeeAmountTxns = txnsWithNonceAndFees.map(
		({ feeAmount, ...rest }) => ({
			...rest,
		})
	)
	const signer = await getSigner({ wallet, provider })
	const signatures = await getMultipleTxSignatures({
		txns: noFeeAmountTxns,
		signer,
	})
	const data = {
		txnsRaw: noFeeAmountTxns,
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

function getPriceInToken({ token, prices, priceInUSD }) {
	const feeTokenPriceUSD = prices[token.symbol]['USD']
	const floatAmount = (feeTokenPriceUSD * priceInUSD).toFixed(token.decimals)
	const feeTokenAmount = parseUnits(floatAmount, token.decimals)

	return feeTokenAmount
}

export async function getTxnsEstimationData({
	// identityAddr,
	txns,
	feeTokenAddr,
	account,
	// mainCurrencyId = 'USD',
	txSpeed,
}) {
	if (!txSpeed) {
		throw new Error('getTxnsEstimationData - txSpeed not provided')
	}
	const assets = getAssets()
	const {
		// gasPriceRatio = 1.07,
		// gasPriceCap,
		feeCollector,
	} = selectRelayerConfig()
	const {
		provider,
		//  IdentityPayable
	} = await getEthersReadOnly()
	const network = selectNetwork().id

	// const { wallet, identity } = account
	const identityAddr = selectAccountIdentityAddr()
	const walletAddress = selectWalletAddress()
	const prices = selectAssetsPrices()

	const feeToken = assets[feeTokenAddr]
	const isNative = feeToken.isETH || feeToken.isNative
	const minTxFee = BigNumber.from('1')
	const estimateTxFee = isNative
		? {
				identityContract: identityAddr,
				// feeTokenAddr,
				to: feeCollector,
				data: '0x',
				value: minTxFee.toHexString(),
				onChainActionData: {
					txAction: {
						...ON_CHAIN_ACTIONS.transferETH({
							tokenData: feeToken,
							amount: minTxFee,
							sender: `Identity (${identityAddr})`,
							recipient: `Relayer ${feeCollector}`,
							relayerFeeTx: true,
						}),
					},
				},
		  }
		: {
				identityContract: identityAddr,
				// feeTokenAddr,
				to: feeTokenAddr,
				data: ERC20.encodeFunctionData('transfer', [
					feeCollector,
					minTxFee.toHexString(),
				]),
				onChainActionData: {
					txAction: {
						...ON_CHAIN_ACTIONS.transferERC20({
							tokenData: feeToken,
							amount: minTxFee,
							sender: `Identity (${identityAddr})`,
							recipient: `Relayer ${feeCollector}`,
							relayerFeeTx: true,
						}),
					},
				},
		  }

	txns.push(estimateTxFee)

	const bundleTxns = txns.map(({ to, value, data }) => [
		to,
		value === '0x' ? 0 : value || 0,
		data || '0x',
	])

	const bundle = new Bundle({
		identity: identityAddr,
		network,
		txns: bundleTxns,
		signer: {
			address: walletAddress,
			// quickAccountManager: '',
		},
	})

	try {
		const nonce = await bundle.getNonce(provider)

		bundle.nonce = nonce

		const estimatedData = await bundle.estimate({
			fetch,
			relayerURL: ADEX_RELAYER_HOST,
		})

		const { success, feeInUSD, message } = estimatedData

		if (!success) {
			throw new Error(t('BUNDLE_ERR_ESTIMATE', { args: [message] }))
		}

		// TODO: handle err

		const feeInFeeToken = {
			slow: getPriceInToken({
				token: feeToken,
				prices,
				priceInUSD: feeInUSD.slow,
			}),
			medium: getPriceInToken({
				token: feeToken,
				prices,
				priceInUSD: feeInUSD.medium,
			}),
			fast: getPriceInToken({
				token: feeToken,
				prices,
				priceInUSD: feeInUSD.fast,
			}),
		}

		const feeInFeeTokenFormatted = {
			slow: formatTokenAmount(
				feeInFeeToken.slow,
				feeToken.decimals,
				false,
				feeToken.decimals
			),
			medium: formatTokenAmount(
				feeInFeeToken.medium,
				feeToken.decimals,
				false,
				feeToken.decimals
			),
			fast: formatTokenAmount(
				feeInFeeToken.fast,
				feeToken.decimals,
				false,
				feeToken.decimals
			),
		}

		estimatedData.feeInFeeToken = feeInFeeToken
		estimatedData.feeInFeeTokenFormatted = feeInFeeTokenFormatted
		estimatedData.gasPriceGWEI = formatUnits(estimatedData.gasPrice, 'gwei')

		// {
		// 	"success": true,
		// 	"gasLimit": 218240,
		// 	"gasPrice": 16105100000,
		// 	"feeInUSD": {
		// 	  "slow": 0.003985757145216,
		// 	  "medium": 0.004871480955264001,
		// 	  "fast": 0.0057572047653120005
		// 	}
		//   }

		// const fees = {
		// 	totalFeesFormatted: formatTokenAmount(
		// 		totalFeesBN,
		// 		feeToken.decimals,
		// 		false,
		// 		feeToken.decimals
		// 	),
		// 	totalFeesBN,
		// 	txnsCount,
		// 	hasDeployTx,
		// 	feeTokenAddr,
		// 	feeTokenSymbol: feeToken.symbol,
		// 	feeTokenDecimals: feeToken.decimals,
		// 	actionMinAmountBN,
		// 	actionMinAmountFormatted: formatTokenAmount(
		// 		actionMinAmountBN,
		// 		feeToken.decimals,
		// 		false,
		// 		feeToken.decimals
		// 	),
		// 	totalEstimatedGasLimitBN,
		// 	totalEstimatedGasLimitFormatted: totalEstimatedGasLimitBN.toString(),
		// 	calculatedGasPriceBN,
		// 	calculatedGasPriceGWEI: formatUnits(
		// 		calculatedGasPriceBN.toString(),
		// 		'gwei'
		// 	),
		// 	calculatedOperationsCount,
		// 	txnsData: txnsDataFormatted,
		// }

		const actionMinAmountBN = estimatedData.feeInFeeToken[txSpeed]
		return {
			...estimatedData,
			actionMinAmountBN,
			feeToken,
			actionMinAmountFormatted: formatTokenAmount(
				actionMinAmountBN,
				feeToken.decimals,
				false,
				feeToken.decimals
			),
			bundle,
		}
	} catch (err) {
		throw new Error(err)
	}

	// TODO: get this data here
	// const feesData = await getWalletIdentityTxnsTotalFees({})
}
