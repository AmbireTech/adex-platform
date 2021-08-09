import {
	assets,
	getPath,
	// uniswapRouters,
	tokens,
	ETH_TOKENS,
} from 'services/adex-wallet'
import { getEthers } from 'services/smart-contracts/ethers'
import {
	utils,
	Contract,
	//   BigNumber
} from 'ethers'

import {
	AUTH_TYPES,
	// EXECUTE_ACTIONS
} from 'constants/misc'

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
	// getWalletIdentityTxnsWithNoncesAndFees,
	// getWalletIdentityTxnsTotalFees,
	// processExecuteWalletTxns,
	// getWalletApproveTxns,
} from './walletIdentity'

const UNI_V3_FACTORY_ADDR = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
const SIGNIFICANT_DIGITS = 6

export async function getUniToken({ address, tokenData, provider }) {
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

export async function getPollStateData({ tokenA, tokenB, fee, provider }) {
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

export async function getUniv2RouteAndTokens({ path, amountOut, provider }) {
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

export async function getUniv3Route({ pools, tokenIn, tokenOut, provider }) {
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

export function isETHBasedToken({ address }) {
	const token = assets[address]
	return ETH_TOKENS.includes(token.symbol)
}

export async function getTradeOutData({
	fromAsset,
	fromAssetAmount,
	fromAssetAmountBN,
	toAsset,
	uniV3Only,
	// slippageTolerance, // TODO:!!!
}) {
	const fromAssetTradableAddr = isETHBasedToken({ address: fromAsset })
		? tokens['WETH']
		: fromAsset

	const {
		// UniSwapRouterV2,
		provider,
		UniSwapQuoterV3,
	} = await getEthers(AUTH_TYPES.READONLY)

	const { path, router, pools } = await getPath({
		from: fromAssetTradableAddr,
		to: toAsset,
		uniV3Only,
	})

	if (uniV3Only && router !== 'uniV3') {
		throw new Error(
			`getTradeOutData uniV3 call but selected router is ${router}`
		)
	}

	const from = assets[fromAssetTradableAddr]
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
			address: fromAssetTradableAddr,
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
