import { assets, getPath, uniswapRouters, tokens } from 'services/adex-wallet'
import { getEthers } from 'services/smart-contracts/ethers'
import { utils, Contract, BigNumber } from 'ethers'
import { contracts } from 'services/smart-contracts/contractsCfg'
import {
	getIdentityTxnsTotalFees,
	processExecuteByFeeTokens,
	getIdentityTxnsWithNoncesAndFees,
} from 'services/smart-contracts/actions/identity'
import { selectMainToken } from 'selectors'
import { AUTH_TYPES, EXECUTE_ACTIONS } from 'constants/misc'

import {
	computePoolAddress,
	Pool,
	Route as RouteV3,
	encodeRouteToPath,
	Trade as TradeV3,
	// Tick,
	// TickListDataProvider,
	nearestUsableTick,
} from '@uniswap/v3-sdk'
import {
	Route as RouteV2,
	Fetcher as FetcherV2,
	Token as TokenV2,
	Trade as TradeV2,
	TokenAmount as TokenAmountV2,
	TradeType as TradeTypeV2,
	Percent as PercentV2,
} from '@uniswap/sdk'
import {
	// Currency,
	Token,
	TradeType,
	CurrencyAmount,
	Percent,
} from '@uniswap/sdk-core'
import { abi as IUniswapV3PoolABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json'
import {
	GAS_LIMITS,
	getWalletIdentityTxnsWithNoncesAndFees,
	getWalletIdentityTxnsTotalFees,
	// processExecuteWalletTxns,
	// getWalletApproveTxns,
} from './walletIdentity'
import { formatTokenAmount } from 'helpers/formatters'
import { t } from 'selectors'
import { formatUnits } from 'ethers/lib/utils'

const UNI_V3_FACTORY_ADDR = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
const SIGNIFICANT_DIGITS = 6

const { Interface, parseUnits } = utils

const ZapperInterface = new Interface(contracts.WalletZapper.abi)
const ERC20 = new Interface(contracts.ERC20.abi)
const AaveLendingPool = new Interface(contracts.AaveLendingPool.abi)

const DEADLINE = 60 * 60 * 1000
const ZERO = BigNumber.from(0)

async function getUniToken({ address, tokenData, provider }) {
	const { chainId } = await provider.getNetwork()
	const token = new Token(
		chainId,
		address,
		tokenData.decimals,
		tokenData.symbol,
		tokenData.name
	)

	return token
}

async function getPollStateData({ tokenA, tokenB, fee, provider }) {
	const poolAddress = computePoolAddress({
		factoryAddress: UNI_V3_FACTORY_ADDR,
		tokenA,
		tokenB,
		fee,
	})

	const poolContract = new Contract(poolAddress, IUniswapV3PoolABI, provider)

	const [
		// factory,
		// token0,
		// token1,
		// fee,
		tickSpacing,
		// maxLiquidityPerTick,
		slot,
		liquidity,
	] = await Promise.all([
		// poolContract.factory(),
		// poolContract.token0(),
		// poolContract.token1(),
		// poolContract.fee(),
		poolContract.tickSpacing(),
		// poolContract.maxLiquidityPerTick(),
		poolContract.slot0(),
		poolContract.liquidity(),
	])

	const tick = slot[1]
	const usableTick = nearestUsableTick(tick, tickSpacing)

	const poolState = {
		liquidity,
		sqrtPriceX96: slot[0],
		tick,
		observationIndex: slot[2],
		observationCardinality: slot[3],
		observationCardinalityNext: slot[4],
		feeProtocol: slot[5],
		unlocked: slot[6],
		tickSpacing,
		usableTick,
		usableTickData: await poolContract.ticks(usableTick),
		currentTickData: await poolContract.ticks(tick),
	}

	// console.log('slot', slot)
	// console.log('poolState', poolState)
	// console.log('poolContract', poolContract)

	return {
		tokenA,
		tokenB,
		poolState,
	}
}

async function getUniv2RouteAndTokens({ path, amountOut, provider }) {
	if (!provider) {
		throw new Error('getUniv2Route - INVALID_PROVIDER')
	}
	const tokens = path.map(tokenAddr => {
		const tokenData = assets[tokenAddr]
		if (!tokenData) {
			throw new Error('getUniv2Route - INVALID_PATH_TOKEN')
		}

		const token = new TokenV2(
			provider.network.chainId,
			tokenAddr,
			tokenData.decimals,
			tokenData.symbol,
			tokenData.name
		)

		return token
	})

	const pairs = []

	for (let index = 0; index < tokens.length - 1; index++) {
		pairs.push(
			await FetcherV2.fetchPairData(tokens[index], tokens[index + 1], provider)
		)
	}

	const tokenIn = tokens[0]
	const tokenOut = tokens[tokens.length - 1]

	const route = new RouteV2(pairs, tokenIn)
	return { route, tokenIn, tokenOut }
}

async function getUniv3Route({ pools, tokenIn, tokenOut, provider }) {
	const poolsWithData = await Promise.all(
		pools.map(async ({ addressTokenA, addressTokenB, fee }) => {
			const tokenA = await getUniToken({
				address: addressTokenA,
				tokenData: assets[addressTokenA],
				provider,
			})
			const tokenB = await getUniToken({
				address: addressTokenB,
				tokenData: assets[addressTokenB],
				provider,
			})

			const { poolState } = await getPollStateData({
				tokenA,
				tokenB,
				fee,
				provider,
			})

			// const tick = new Tick({
			// 	index: poolState.usableTick,
			// 	liquidityGross: poolState.usableTickData.liquidityGross,
			// 	liquidityNet: poolState.usableTickData.liquidityNet,
			// })

			// const ticksDataProvider = new TickListDataProvider(
			// 	[tick],
			// 	poolState.tickSpacing
			// )

			const pool = new Pool(
				tokenA,
				tokenB,
				fee,
				poolState.sqrtPriceX96,
				poolState.liquidity,
				poolState.tick
				// ticksDataProvider
			)

			return pool
		})
	)

	const route = new RouteV3(poolsWithData, tokenIn, tokenOut)

	return route
}

export async function getTradeOutData({
	fromAsset,
	fromAssetAmount,
	fromAssetAmountBN,
	toAsset,
	uniV3Only,
	// slippageTolerance, // TODO:!!!
}) {
	const {
		// UniSwapRouterV2,
		provider,
		UniSwapQuoterV3,
	} = await getEthers(AUTH_TYPES.READONLY)

	const { path, router, pools } = await getPath({
		from: fromAsset,
		to: toAsset,
		uniV3Only,
	})

	if (uniV3Only && router !== 'uniV3') {
		throw new Error(
			`getTradeOutData uniV3 call but selected router is ${router}`
		)
	}

	const from = assets[fromAsset]
	const to = assets[toAsset]

	const fromAmount =
		fromAssetAmountBN ||
		utils.parseUnits(fromAssetAmount.toString(), from.decimals)

	if (router === 'uniV2') {
		// const amountsOut = await UniSwapRouterV2.getAmountsOut(fromAmount, path)

		const {
			route,
			tokenIn,
			//tokenOut
		} = await getUniv2RouteAndTokens({
			path,
			provider,
		})

		const tokenInAmount = new TokenAmountV2(tokenIn, fromAmount)

		const trade = new TradeV2(route, tokenInAmount, TradeTypeV2.EXACT_INPUT)

		const midPrice = route.midPrice.toSignificant(SIGNIFICANT_DIGITS)
		const priceImpact = trade.priceImpact.toSignificant(SIGNIFICANT_DIGITS)
		const executionPrice = trade.executionPrice.toSignificant(
			SIGNIFICANT_DIGITS
		)
		const executionPriceInverted = trade.executionPrice
			.invert()
			.toSignificant(SIGNIFICANT_DIGITS)

		const slippageTolerance = new PercentV2(5, 1000)
		const minimumAmountOut = trade
			.minimumAmountOut(slippageTolerance)
			.toFixed(to.decimals)

		const expectedAmountOut = trade.outputAmount.toSignificant(
			SIGNIFICANT_DIGITS
		)

		const routeTokens = trade.route.path.map(x => x.symbol)

		return {
			minimumAmountOut,
			midPrice,
			priceImpact,
			executionPrice,
			executionPriceInverted,
			expectedAmountOut,
			slippageTolerance: slippageTolerance.toSignificant(2),
			routeTokens,
			router,
		}
	}

	if (router === 'uniV3') {
		const tokenIn = await getUniToken({
			address: fromAsset,
			tokenData: from,
			provider,
		})
		const tokenOut = await getUniToken({
			address: toAsset,
			tokenData: to,
			provider,
		})

		const isSingleSwap = pools.length === 1
		const route = await getUniv3Route({ pools, tokenIn, tokenOut, provider })
		const amountInHex = fromAmount.toHexString()

		// ABI - changed functions as read
		// https://twitter.com/dcfgod/status/1405608315011411970?s=20
		const action = isSingleSwap ? 'quoteExactInputSingle' : 'quoteExactInput'
		const args = isSingleSwap
			? [
					tokenIn.address,
					tokenOut.address,
					pools[0].fee,
					amountInHex,
					0, // sqrtPriceLimitX96
			  ]
			: [encodeRouteToPath(route, false), amountInHex]

		const amountOut = await UniSwapQuoterV3[action](...args)

		const fromTokenCurrencyAmount = CurrencyAmount.fromRawAmount(
			tokenIn,
			fromAmount
		)

		const toTokenCurrencyAmount = CurrencyAmount.fromRawAmount(
			tokenOut,
			amountOut
		)

		const trade = new TradeV3({
			route,
			inputAmount: fromTokenCurrencyAmount,
			outputAmount: toTokenCurrencyAmount,
			tradeType: TradeType.EXACT_INPUT,
		})

		// const bestTrade = await TradeV3.bestTradeExactIn(
		// 	route.pools,
		// 	fromTokenCurrencyAmount,
		// 	tokenOut
		// )

		// console.log('bestTrade', bestTrade)

		const slippageTolerance = new Percent(5, 1000)
		const minimumAmountOut = trade
			.minimumAmountOut(slippageTolerance)
			.toSignificant(SIGNIFICANT_DIGITS)

		const priceImpact = trade.priceImpact.toSignificant(SIGNIFICANT_DIGITS)
		const executionPrice = trade.executionPrice.toSignificant(
			SIGNIFICANT_DIGITS
		)
		const executionPriceInverted = trade.executionPrice
			.invert()
			.toSignificant(SIGNIFICANT_DIGITS)
		const expectedAmountOut = trade.executionPrice
			.quote(trade.inputAmount)
			.toSignificant(SIGNIFICANT_DIGITS)

		const routeTokens = trade.route.tokenPath.map(x => x.symbol)

		return {
			expectedAmountOut,
			minimumAmountOut,
			priceImpact,
			executionPrice,
			executionPriceInverted,
			slippageTolerance: slippageTolerance.toSignificant(2),
			routeTokens,
			router,
		}
	}

	throw new Error('Invalid path')
}

async function getWalletTradeTxns({
	getFeesOnly,
	account,
	fromAsset,
	fromAssetAmount,
	fromAssetAmountAfterFeesCalcBN,
	toAsset,
	lendOutputToAAVE = false,
}) {
	const { wallet, identity } = account
	const { authType } = wallet
	const { path, router, pools } = await getPath({
		from: fromAsset,
		to: toAsset,
	})

	const identityAddr = identity.address
	const {
		provider,
		WalletZapper,
		IdentityPayable,
		// getToken,
		UniSwapRouterV3,
		// UniSwapQuoterV3,
	} = await getEthers(authType)

	const feeTokenAddr = fromAsset

	const from = assets[fromAsset]
	const to = assets[toAsset]

	const fromAssetAmountUserInputBN = utils.parseUnits(
		fromAssetAmount.toString(),
		from.decimals
	)

	const fromAmount =
		getFeesOnly || !fromAssetAmountAfterFeesCalcBN
			? fromAssetAmountUserInputBN
			: fromAssetAmountAfterFeesCalcBN

	const fromAmountHex = fromAmount.toHexString()

	const {
		expectedAmountOut,
		minimumAmountOut,
		priceImpact,
		executionPrice,
		slippageTolerance,
		routeTokens,
	} = await getTradeOutData({
		fromAsset,
		fromAssetAmountBN: fromAmount,
		toAsset,
	})

	const toAmount = utils.parseUnits(expectedAmountOut.toString(), to.decimals)
	const minOut = utils.parseUnits(minimumAmountOut.toString(), to.decimals)

	const txns = []

	txns.push({
		identityContract: identityAddr,
		to: fromAsset,
		feeTokenAddr,
		data: ERC20.encodeFunctionData('transfer', [
			WalletZapper.address,
			fromAmountHex,
		]),
		operationsGasLimits: [GAS_LIMITS.transfer],
	})

	if (router === 'uniV2') {
		const tradeTuple = [
			uniswapRouters.uniV2,
			fromAmountHex,
			minOut.toHexString(),
			path,
			lendOutputToAAVE,
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
			// TODO: gas limits for each swap in the trade
			operationsGasLimits: [GAS_LIMITS.swapV2],
		})
	} else if (router === 'uniV3') {
		const deadline = Math.floor((Date.now() + DEADLINE) / 1000)

		let data = null

		// console.log('lendOutputToAAVE', lendOutputToAAVE)
		if (pools.length === 1) {
			data = ZapperInterface.encodeFunctionData('tradeV3Single', [
				UniSwapRouterV3.address,
				[
					fromAsset,
					toAsset,
					pools[0].fee,
					identityAddr,
					deadline,
					fromAmountHex,
					minOut.toHexString(),
					// poolState.sqrtPriceX96,
					0,
				],
				lendOutputToAAVE, // TODO: update Zapper to accept wrap param on tradeV3Single
			])
		} else if (pools.length > 1) {
			if (lendOutputToAAVE) {
				return walletDiversificationTransaction({
					getFeesOnly,
					account,
					fromAsset,
					fromAssetAmount,
					diversificationAssets: [
						{
							address: toAsset,
							share: 100,
							lendOutputToAAVE,
						},
					],
				})
			}

			const tokenIn = await getUniToken({
				address: fromAsset,
				tokenData: from,
				provider,
			})
			const tokenOut = await getUniToken({
				address: toAsset,
				tokenData: to,
				provider,
			})

			const route = await getUniv3Route({ pools, tokenIn, tokenOut, provider })
			const v3Path = encodeRouteToPath(route)

			data = ZapperInterface.encodeFunctionData('tradeV3', [
				UniSwapRouterV3.address,
				[v3Path, identityAddr, deadline, fromAmount, minOut.toHexString()],
			])
		}

		txns.push({
			identityContract: identityAddr,
			to: WalletZapper.address,
			feeTokenAddr,
			data,
			operationsGasLimits: pools.map(() => GAS_LIMITS.swapV3),
		})
	}

	const txnsWithNonceAndFees = await getWalletIdentityTxnsWithNoncesAndFees({
		txns,
		identityAddr,
		provider,
		Identity: IdentityPayable,
		account,
		feeTokenAddr,
	})

	const tradeData = {
		expectedAmountOut,
		minimumAmountOut,
		priceImpact,
		executionPrice,
		slippageTolerance,
		routeTokens,
		router,
		toAmount,
		toAsset,
		fromAsset,
	}

	return { txnsWithNonceAndFees, fromAssetAmountUserInputBN, tradeData }
}

export async function walletTradeTransaction({
	account,
	fromAsset,
	fromAssetAmount, // User input amount
	toAsset,
	lendOutputToAAVE = false,
}) {
	const from = assets[fromAsset]

	// Pre call to get fees
	const {
		txnsWithNonceAndFees: _preTxnsWithNonceAndFees,
		fromAssetAmountUserInputBN: _preFromAssetAmountUserInputBN,
	} = await getWalletTradeTxns({
		getFeesOnly: true,
		account,
		fromAsset,
		fromAssetAmount,
		// fromAssetAmountAfterFeesCalcBN,
		toAsset,
		lendOutputToAAVE,
	})

	const {
		totalFeesBN: _preTotalFeesBN,
		totalFeesFormatted: _preTotalFeesFormatted,
	} = await getWalletIdentityTxnsTotalFees({
		txnsWithNonceAndFees: _preTxnsWithNonceAndFees,
	})

	const mainActionAmountBN = _preFromAssetAmountUserInputBN.sub(_preTotalFeesBN)
	const mainActionAmountFormatted = formatTokenAmount(
		mainActionAmountBN,
		from.decimals,
		false,
		from.decimals
	)
	if (mainActionAmountBN.lt(ZERO)) {
		throw new Error(
			t('ERR_NO_BALANCE_FOR_FEES', {
				args: [from.symbol, _preTotalFeesFormatted],
			})
		)
	}

	// Actual call with fees pre calculated
	const {
		txnsWithNonceAndFees,
		fromAssetAmountUserInputBN,
		tradeData,
	} = await getWalletTradeTxns({
		getFeesOnly: false, // Important on actual call
		account,
		fromAsset,
		fromAssetAmount,
		fromAssetAmountAfterFeesCalcBN: mainActionAmountBN,
		toAsset,
		lendOutputToAAVE,
	})

	const {
		totalFees,
		totalFeesBN,
		...rest
	} = await getWalletIdentityTxnsTotalFees({
		txnsWithNonceAndFees,
	})

	return {
		txnsWithNonceAndFees,
		totalFeesBN,
		// totalFeesFormatted, // in rest,
		// feeTokenAddr, //in ..rest
		// actionMinAmountBN, // in ...rest
		// actionMinAmountFormatted, // in ...rest
		spendTokenAddr: fromAsset,
		totalAmountToSpendBN: fromAssetAmountUserInputBN, // Total amount out
		totalAmountToSpendFormatted: fromAssetAmount, // Total amount out
		mainActionAmountBN,
		mainActionAmountFormatted,
		...rest,
		actionMeta: {
			// NOTE: the trade data at final preview with fees excluded from input
			tradeData,
		},
	}
}

async function getDiversificationTxns({
	getFeesOnly,
	account,
	fromAsset,
	fromAssetAmount,
	fromAssetAmountBN,
	fromAssetAmountAfterFeesCalcBN,
	diversificationAssets,
	lendOutputToAAVE = false,
}) {
	const { wallet, identity } = account
	const { authType } = wallet

	const identityAddr = identity.address
	const {
		provider,
		WalletZapper,
		IdentityPayable,
		// getToken,
		UniSwapRouterV3,
		UniSwapQuoterV3,
	} = await getEthers(authType)

	const feeTokenAddr = fromAsset

	const { router, pools } = getPath({
		from: fromAsset,
		to: tokens['WETH'],
	})

	if (fromAsset !== tokens['WETH']) {
		if (router !== 'uniV3') {
			throw new Error('walletDiversificationTransaction - fromAsset not uniV3')
		}

		if (!pools || pools.length !== 1) {
			throw new Error(
				'walletDiversificationTransaction - fromAsset not a single trade'
			)
		}
	}

	const from = assets[fromAsset]
	const weth = assets[tokens['WETH']]
	const deadline = Math.floor((Date.now() + DEADLINE) / 1000)

	const fromAssetAmountUserInputBN =
		fromAssetAmountBN ||
		utils.parseUnits(fromAssetAmount.toString(), from.decimals)

	const fromAmount =
		getFeesOnly || !fromAssetAmountAfterFeesCalcBN
			? fromAssetAmountUserInputBN
			: fromAssetAmountAfterFeesCalcBN

	const txns = []
	const tokensOutData = []

	const tokenIn = await getUniToken({
		address: fromAsset,
		tokenData: from,
		provider,
	})

	const wethIn = await getUniToken({
		address: tokens['WETH'],
		tokenData: weth,
		provider,
	})

	const WETHOutIndex = diversificationAssets.findIndex(
		x => x.address === wethIn.address
	)

	const hasWETHOut = WETHOutIndex > -1

	let wethAmountIn = ZERO
	let toTransferAmountIn = ZERO
	let toSwapAmountInToWETH = ZERO

	const WETHOutShare = hasWETHOut
		? diversificationAssets[WETHOutIndex].share
		: 0
	let usedShares = 0 //WETHOutShare

	if (!hasWETHOut && tokenIn.address === wethIn.address) {
		wethAmountIn = fromAmount
		toTransferAmountIn = wethAmountIn
	} else if (hasWETHOut && tokenIn.address === wethIn.address) {
		const wethAmountOut = fromAmount.mul(WETHOutShare * 10).div(1000)

		tokensOutData.push({
			address: wethIn.address,
			share: WETHOutShare,
			amountOutMin: new TokenAmountV2(wethIn, wethAmountOut).toSignificant(
				SIGNIFICANT_DIGITS
			),
		})

		wethAmountIn = fromAmount.sub(wethAmountOut)
		toTransferAmountIn = wethAmountIn
	} else {
		const allocatedInputToken = diversificationAssets.find(
			x => x.address === fromAsset
		)

		const allocatedInputTokenAmount = allocatedInputToken
			? fromAmount.mul(allocatedInputToken.share * 10).div(1000)
			: ZERO

		if (allocatedInputToken) {
			usedShares += allocatedInputToken.share
			tokensOutData.push({
				address: allocatedInputToken.address,
				share: allocatedInputToken.share,
				amountOutMin: new TokenAmountV2(
					tokenIn,
					allocatedInputTokenAmount
				).toSignificant(SIGNIFICANT_DIGITS),
			})
		}

		toSwapAmountInToWETH = hasWETHOut
			? fromAmount.mul(Math.floor(WETHOutShare * 10)).div(1000)
			: ZERO

		toTransferAmountIn = fromAmount.sub(allocatedInputTokenAmount)

		const wethAmountInData = await getTradeOutData({
			fromAsset: tokenIn.address,
			fromAssetAmountBN: toTransferAmountIn,
			toAsset: tokens['WETH'],
			uniV3Only: true,
		})

		wethAmountIn = parseUnits(wethAmountInData.minimumAmountOut, weth.decimals)
	}

	if (!toTransferAmountIn.isZero()) {
		txns.push({
			identityContract: identityAddr,
			to: fromAsset,
			feeTokenAddr,
			data: ERC20.encodeFunctionData('transfer', [
				WalletZapper.address,
				toTransferAmountIn.toHexString(),
			]),
			operationsGasLimits: [GAS_LIMITS.transfer],
		})
	}

	const extraGasOperations = []

	if (!toSwapAmountInToWETH.isZero()) {
		// NOTE: last version of zapper returns the dust WETH
		// Can be used to swap WETH only once
		extraGasOperations.push(GAS_LIMITS.transfer)

		// Only for preview info
		const toWETHAmountOutData = await getTradeOutData({
			fromAsset: tokenIn.address,
			fromAssetAmountBN: toSwapAmountInToWETH,
			toAsset: tokens['WETH'],
			uniV3Only: true,
		})

		if (toWETHAmountOutData && toWETHAmountOutData.minimumAmountOut) {
			tokensOutData.push({
				address: wethIn.address,
				share: WETHOutShare,
				amountOutMin: toWETHAmountOutData.minimumAmountOut,
			})
		}
	}

	const diversificationAssetsToDiversify = [...diversificationAssets].filter(
		x => x.address !== fromAsset && x.address !== tokens['WETH']
	)

	const diversificationsSharesLeft = 100 - usedShares || 0
	const diversificationTrades = await Promise.all(
		diversificationAssetsToDiversify.map(async asset => {
			const to = assets[asset.address]

			const { router, pools } = await getPath({
				from: tokens['WETH'],
				to: asset.address,
			})

			if (router !== 'uniV3') {
				throw new Error(
					`diversificationTrades -  Unsupported router ${router} ${to.symbol}`
				)
			}

			if (!pools || pools.length > 1) {
				throw new Error(
					`diversificationTrades -  not single trade ${router} ${to.symbol}`
				)
			}

			const pool = pools[0]
			const tokenOut = await getUniToken({
				address: asset.address,
				tokenData: to,
				provider,
			})

			const flattedShare = Math.round(
				(asset.share * 10 * 1000) / (diversificationsSharesLeft * 10)
			)

			usedShares += asset.share

			const amountIn = BigNumber.from(wethAmountIn)
				// .mul(Math.floor(asset.share * 10))
				.mul(flattedShare)
				.div(1000)

			const { minimumAmountOut } = await getTradeOutData({
				fromAsset: wethIn.address,
				fromAssetAmountBN: amountIn,
				toAsset: tokenOut.address,
				uniV3Only: true,
			})

			// console.log('amountOutMin', amountOutMin.toSignificant(2))

			const wrap = !!asset.lendOutputToAAVE || !!lendOutputToAAVE

			tokensOutData.push({
				address: asset.address,
				share: asset.share,
				amountOutMin: minimumAmountOut,
				wrap,
			})

			return [
				asset.address,
				pool.fee,
				flattedShare,
				utils.parseUnits(minimumAmountOut, to.decimals).toHexString(),
				wrap,
			]
		})
	)

	// const diversificationsAllocated = diversificationTrades.reduce(
	// 	(sum, x) => sum + x[2],
	// 	0
	// )

	if (usedShares + WETHOutShare !== 100) {
		throw new Error('not 100 diversification alloc points')
	}

	const args = [
		UniSwapRouterV3.address,
		fromAsset,
		fromAsset !== tokens['WETH'] ? pools[0].fee : 0x0, // inputFee
		wethAmountIn.toString(), //inputMinOut.toString(),
		diversificationTrades,
	]

	txns.push({
		identityContract: identityAddr,
		to: WalletZapper.address,
		feeTokenAddr,
		data: ZapperInterface.encodeFunctionData('diversifyV3', args),
		operationsGasLimits: diversificationTrades.reduce((limits, trade) => {
			const tradeLimits = trade.wrap
				? [GAS_LIMITS.swapV3, GAS_LIMITS.wrap]
				: [GAS_LIMITS.swapV3]
			limits = [...limits, ...tradeLimits]
			return limits
		}, []),
	})

	const txnsWithNonceAndFees = await getWalletIdentityTxnsWithNoncesAndFees({
		txns,
		identityAddr,
		provider,
		Identity: IdentityPayable,
		account,
		feeTokenAddr,
	})

	return { txnsWithNonceAndFees, fromAssetAmountUserInputBN, tokensOutData }
}

export async function walletDiversificationTransaction({
	account,
	fromAsset,
	fromAssetAmount,
	fromAssetAmountBN,
	diversificationAssets,
}) {
	const from = assets[fromAsset]
	// Pre call to get fees
	const {
		txnsWithNonceAndFees: _preTxnsWithNonceAndFees,
		fromAssetAmountUserInputBN: _preFromAssetAmountUserInputBN,
	} = await getDiversificationTxns({
		getFeesOnly: true,
		account,
		fromAsset,
		fromAssetAmount,
		fromAssetAmountBN,
		// fromAssetAmountAfterFeesCalcBN,
		diversificationAssets,
	})

	const {
		totalFeesBN: _preTotalFeesBN,
		totalFeesFormatted: _preTotalFeesFormatted,
	} = await getWalletIdentityTxnsTotalFees({
		txnsWithNonceAndFees: _preTxnsWithNonceAndFees,
	})

	const mainActionAmountBN = _preFromAssetAmountUserInputBN.sub(_preTotalFeesBN)
	const mainActionAmountFormatted = formatTokenAmount(
		mainActionAmountBN,
		from.decimals,
		false,
		from.decimals
	)

	if (mainActionAmountBN.lt(ZERO)) {
		throw new Error(
			t('ERR_NO_BALANCE_FOR_FEES', {
				args: [from.symbol, _preTotalFeesFormatted],
			})
		)
	}

	// console.log(
	// 	'_preTotalFeesBN',
	// 	formatTokenAmount(_preTotalFeesBN, from.decimals, false, from.decimals)
	// )

	// Actual call with fees pre calculated
	const {
		txnsWithNonceAndFees,
		fromAssetAmountUserInputBN,
		// tradeData,
		tokensOutData,
	} = await getDiversificationTxns({
		getFeesOnly: false,
		account,
		fromAsset,
		fromAssetAmount,
		fromAssetAmountBN,
		fromAssetAmountAfterFeesCalcBN: mainActionAmountBN,
		diversificationAssets,
	})

	const {
		totalFees,
		totalFeesBN,
		...rest
	} = await getWalletIdentityTxnsTotalFees({
		txnsWithNonceAndFees,
	})

	return {
		txnsWithNonceAndFees,
		totalFeesBN,
		// totalFeesFormatted, // in rest,
		// feeTokenAddr, //in ..rest
		// actionMinAmountBN, // in ...rest
		// actionMinAmountFormatted, // in ...rest
		spendTokenAddr: fromAsset,
		totalAmountToSpendBN: fromAssetAmountUserInputBN, // Total amount out
		totalAmountToSpendFormatted: fromAssetAmount, // Total amount out
		mainActionAmountBN,
		mainActionAmountFormatted,
		...rest,
		actionMeta: {
			// NOTE: the trade data at final preview with fees excluded from input
			// tradeData,
			tokensOutData,
		},
	}
}

async function getWithdrawTxns({
	account,
	amountToWithdraw,
	amountToWithdrawAfterFeesCalcBN,
	withdrawTo,
	getFeesOnly,
	withdrawAssetAddr,
	// getMinAmountToSpend,
	tokenData,
}) {
	const { wallet, identity } = account
	const { authType } = wallet
	const {
		provider,
		IdentityPayable,
		//   getToken
	} = await getEthers(authType)
	const identityAddr = identity.address

	const token = assets[withdrawAssetAddr]

	const feeTokenAddr = withdrawAssetAddr

	if (!tokenData) {
		throw new Error('walletWithdraw - invalid withdraw token address')
	}

	const txns = []

	const amountToWithdrawBN = parseUnits(amountToWithdraw, token.decimals)

	const amountToUnwrap = BigNumber.from(tokenData.balance)
		.sub(amountToWithdrawBN)
		.lt(ZERO)
		? amountToWithdrawBN.sub(tokenData.balance)
		: ZERO

	const aaveInterestToken = tokenData.specific.find(x => x.isAaveInterestToken)

	// console.log('amountToUnwrap', amountToUnwrap.toString())
	// console.log(
	// 	'aaveInterestToken',
	// 	BigNumber.from(aaveInterestToken.balance).toString()
	// )

	if (amountToUnwrap.gt(ZERO) && aaveInterestToken) {
		const unwrapTx = {
			identityContract: identityAddr,
			feeTokenAddr,
			to: contracts.AaveLendingPool.address,
			data: AaveLendingPool.encodeFunctionData('withdraw', [
				withdrawAssetAddr,
				amountToUnwrap.toHexString(),
				identityAddr,
			]),
			operationsGasLimits: [GAS_LIMITS.unwrap],
		}

		txns.push(unwrapTx)
	}

	const withdrawTx = {
		identityContract: identityAddr,
		feeTokenAddr,
		to: withdrawAssetAddr,
		data: ERC20.encodeFunctionData('transfer', [
			withdrawTo,
			getFeesOnly
				? amountToWithdrawBN.sub(amountToUnwrap).toHexString()
				: amountToWithdrawAfterFeesCalcBN.toHexString(),
		]),
		operationsGasLimits: [GAS_LIMITS.transfer],
	}

	txns.push(withdrawTx)

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
		amountToWithdrawBN,
		//  tradeData
	}
}

export async function walletWithdrawTransaction({
	account,
	amountToWithdraw,
	withdrawTo,
	withdrawAssetAddr,
	assetsDataRaw,
	getMinAmountToSpend,
}) {
	const tokenData = assetsDataRaw[withdrawAssetAddr]

	// Pre call to get fees
	const {
		txnsWithNonceAndFees: _preTxnsWithNonceAndFees,
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
	const { txnsWithNonceAndFees, amountToWithdrawBN } = await getWithdrawTxns({
		account,
		amountToWithdraw,
		amountToWithdrawAfterFeesCalcBN: mainActionAmountBN,
		withdrawTo,
		getFeesOnly: false, // !!Important
		withdrawAssetAddr,
		tokenData,
		getMinAmountToSpend,
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
		spendTokenAddr: withdrawAssetAddr,
		totalAmountToSpendBN: amountToWithdrawBN, // Total amount out
		totalAmountToSpendFormatted: amountToWithdraw, // Total amount out
		mainActionAmountBN,
		mainActionAmountFormatted,
		...rest,
		actionMeta: {
			withdrawAssetAddr,
		},
	}
}

export async function walletSetIdentityPrivilege({
	account,
	setAddr,
	privLevel,
	getFeesOnly,
}) {
	const { wallet, identity } = account
	const { provider, IdentityPayable, getToken } = await getEthers(
		wallet.authType
	)
	const identityAddr = identity.address

	const identityInterface = new Interface(IdentityPayable.abi)

	const mainToken = selectMainToken()
	const feeTokenAddr = mainToken.address

	const tx1 = {
		identityContract: identityAddr,
		feeTokenAddr,
		to: identityAddr,
		data: identityInterface.encodeFunctionData('setAddrPrivilege', [
			setAddr,
			privLevel,
		]),
	}

	const txns = [tx1]
	const txnsByFeeToken = await getIdentityTxnsWithNoncesAndFees({
		txns,
		identityAddr,
		provider,
		Identity: IdentityPayable,
		account,
		getToken,
		executeAction: EXECUTE_ACTIONS.privilegesChange,
	})

	if (getFeesOnly) {
		const {
			// total,
			totalBN,
			breakdownFormatted,
		} = await getIdentityTxnsTotalFees({
			txnsByFeeToken,
		})
		return {
			feesAmountBN: totalBN,
			feeTokenAddr,
			spendTokenAddr: feeTokenAddr,
			amountToSpendBN: totalBN,
			breakdownFormatted,
		}
	}

	const result = await processExecuteByFeeTokens({
		txnsByFeeToken,
		identityAddr,
		wallet,
		provider,
		extraData: {
			setAddr,
			privLevel,
		},
	})

	return {
		result,
	}
}
