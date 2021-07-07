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
import ERC20TokenABI from 'services/smart-contracts/abi/ERC20Token'

import {
	computePoolAddress,
	Pool,
	Route as RouteV3,
	encodeRouteToPath,
	Trade as TradeV3,
	Tick,
	TickListDataProvider,
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

const UNI_V3_FACTORY_ADDR = '0x1F98431c8aD98523631AE4a59f267346ea31F984'

const { Interface } = utils

const ZapperInterface = new Interface(contracts.WalletZapper.abi)
const ERC20 = new Interface(ERC20TokenABI)

const DEADLINE = 60 * 60 * 1000
const ZERO = BigNumber.from(0)

function getUniToken({ address, tokenData, chainId = 5 }) {
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
		pairs.push(await FetcherV2.fetchPairData(tokens[index], tokens[index + 1]))
	}

	const tokenIn = tokens[0]
	const tokenOut = tokens[tokens.length - 1]

	const route = new RouteV2(pairs, tokenIn)
	return { route, tokenIn, tokenOut }
}

async function getUniv3Route({ pools, tokenIn, tokenOut, provider }) {
	const poolsWithData = await Promise.all(
		pools.map(async ({ addressTokenA, addressTokenB, fee }) => {
			const tokenA = getUniToken({
				address: addressTokenA,
				tokenData: assets[addressTokenA],
			})
			const tokenB = getUniToken({
				address: addressTokenB,
				tokenData: assets[addressTokenB],
			})

			const { poolState } = await getPollStateData({
				tokenA,
				tokenB,
				fee,
				provider,
			})

			const tick = new Tick({
				index: poolState.usableTick,
				liquidityGross: poolState.usableTickData.liquidityGross,
				liquidityNet: poolState.usableTickData.liquidityNet,
			})

			const ticksDataProvider = new TickListDataProvider(
				[tick],
				poolState.tickSpacing
			)

			const pool = new Pool(
				tokenA,
				tokenB,
				fee,
				poolState.sqrtPriceX96,
				poolState.liquidity,
				poolState.tick,
				ticksDataProvider
			)

			return pool
		})
	)

	const route = new RouteV3(poolsWithData, tokenIn, tokenOut)

	return route
}

export async function getTradeOutData({ formAsset, formAssetAmount, toAsset }) {
	if (!formAssetAmount || parseFloat(formAssetAmount) <= 0) {
		return '0'
	}
	const {
		// UniSwapRouterV2,
		provider,
		UniSwapQuoterV3,
	} = await getEthers(AUTH_TYPES.READONLY)

	const { path, router, pools } = await getPath({
		from: formAsset,
		to: toAsset,
	})

	const from = assets[formAsset]
	const to = assets[toAsset]

	const fromAmount = utils.parseUnits(formAssetAmount.toString(), from.decimals)
	// .toHexString()

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

		const midPrice = route.midPrice
		const priceImpact = midPrice.raw.subtract(trade.executionPrice.raw)
		// .toSignificant()

		const minimumAmountOut = trade
			.minimumAmountOut(new PercentV2(5, 1000))
			.toSignificant()

		return {
			minimumAmountOut,
			priceImpact,
		}
	}

	if (router === 'uniV3') {
		const tokenIn = getUniToken({
			address: formAsset,
			tokenData: from,
		})
		const tokenOut = getUniToken({
			address: toAsset,
			tokenData: to,
		})

		const isSingleSwap = pools.length === 1

		const route = await getUniv3Route({ pools, tokenIn, tokenOut, provider })
		const amountInHex = utils
			.parseUnits(formAssetAmount.toString(), from.decimals)
			.toHexString()

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
			: [encodeRouteToPath(route), amountInHex]

		const amountOut = await UniSwapQuoterV3[action](...args)

		const fromTokenCurrencyAmount = CurrencyAmount.fromRawAmount(
			tokenIn,
			utils.parseUnits(formAssetAmount.toString(), from.decimals)
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

		const minimumAmountOut = trade
			.minimumAmountOut(new Percent(5, 1000))
			.toSignificant()

		const priceImpact = trade.priceImpact.toSignificant()

		return {
			minimumAmountOut,
			priceImpact,
		}
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
	const { path, router, pools } = await getPath({
		from: formAsset,
		to: toAsset,
	})

	const identityAddr = identity.address
	const {
		provider,
		WalletZapper,
		Identity,
		getToken,
		UniSwapRouterV3,
	} = await getEthers(authType)

	// TODO: use swap tokens for fees - update relayer
	// Add token to feeTokenWhitelist
	const mainToken = selectMainToken()

	const feeTokenAddr = mainToken.address

	const from = assets[formAsset]
	const to = assets[toAsset]

	const fromAmount = utils
		.parseUnits(formAssetAmount.toString(), from.decimals)
		.toHexString()
	const toAmount = utils
		.parseUnits(toAssetAmount.toString(), to.decimals)
		.toHexString()

	const txns = []

	// TODO: approve?

	txns.push({
		identityContract: identityAddr,
		to: formAsset,
		feeTokenAddr,
		data: ERC20.encodeFunctionData('transfer', [
			WalletZapper.address,
			fromAmount,
		]),
	})

	if (router === 'uniV2') {
		const tradeTuple = [uniswapRouters.uniV2, fromAmount, toAmount, path, false]

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
	} else if (router === 'uniV3') {
		const deadline = Math.floor((Date.now() + DEADLINE) / 1000)

		let data = null

		if (pools.length === 1) {
			data = ZapperInterface.encodeFunctionData('tradeV3Single', [
				UniSwapRouterV3.address,
				[
					formAsset,
					toAsset,
					pools[0].fee,
					identityAddr,
					deadline,
					fromAmount,
					toAmount,
					// poolState.sqrtPriceX96,
					0,
				],
			])
		} else if (pools.length > 1) {
			const tokenIn = getUniToken({
				address: formAsset,
				tokenData: from,
			})
			const tokenOut = getUniToken({
				address: toAsset,
				tokenData: to,
			})

			const route = await getUniv3Route({ pools, tokenIn, tokenOut, provider })
			const v3Path = encodeRouteToPath(route)

			data = ZapperInterface.encodeFunctionData('tradeV3', [
				UniSwapRouterV3.address,
				[v3Path, identityAddr, deadline, fromAmount, toAmount],
			])
		}

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

export async function walletDiversificationTransaction({
	getFeesOnly,
	account,
	formAsset,
	formAssetAmount,
	diversificationAssets,
}) {
	const { wallet, identity } = account
	const { authType } = wallet

	const identityAddr = identity.address
	const {
		provider,
		WalletZapper,
		Identity,
		getToken,
		UniSwapRouterV3,
		UniSwapQuoterV3,
	} = await getEthers(authType)

	// TODO: use swap tokens for fees - update relayer
	// Add tokent to feeTokenWhitelist
	const mainToken = selectMainToken()

	const feeTokenAddr = mainToken.address

	const { router, pools } = getPath({
		from: formAsset,
		to: tokens['WETH'],
	})

	if (formAsset !== tokens['WETH']) {
		if (router !== 'uniV3') {
			throw new Error('walletDiversificationTransaction - fromAsset not uniV3')
		}

		if (!pools || pools.length !== 1) {
			throw new Error(
				'walletDiversificationTransaction - fromAsset not a single trade'
			)
		}
	}

	const from = assets[formAsset]
	const weth = assets[tokens['WETH']]
	const deadline = Math.floor((Date.now() + DEADLINE) / 1000)

	const fromAmount = utils.parseUnits(formAssetAmount.toString(), from.decimals)

	const txns = []

	const tokenIn = getUniToken({
		address: formAsset,
		tokenData: from,
	})

	const wethIn = getUniToken({
		address: tokens['WETH'],
		tokenData: weth,
	})

	const WETHOutIndex = diversificationAssets.findIndex(
		x => x.address === wethIn.address
	)

	const hasWETHOut = WETHOutIndex > -1

	let wethAmountIn = ZERO
	let toTransferAmountIn = ZERO
	let toSwapAmountInToWETH = ZERO

	let usedShares = hasWETHOut ? diversificationAssets[WETHOutIndex].share : 0

	if (!hasWETHOut && tokenIn.address === wethIn.address) {
		wethAmountIn = utils.parseUnits(formAssetAmount.toString(), weth.decimals)
		toTransferAmountIn = wethAmountIn
	} else if (hasWETHOut && tokenIn.address === wethIn.address) {
		const wethAmountOut = fromAmount
			.mul(diversificationAssets[WETHOutIndex].share * 10)
			.div(1000)

		wethAmountIn = fromAmount.sub(wethAmountOut)
		toTransferAmountIn = wethAmountIn
	} else {
		const allocatedInputToken = diversificationAssets.find(
			x => x.address === formAsset
		)

		usedShares += allocatedInputToken.share

		toSwapAmountInToWETH = hasWETHOut
			? fromAmount.mul(diversificationAssets[WETHOutIndex].share * 10).div(1000)
			: ZERO

		toTransferAmountIn = allocatedInputToken
			? fromAmount.sub(fromAmount.mul(allocatedInputToken.share * 10).div(1000))
			: fromAmount

		wethAmountIn = await UniSwapQuoterV3['quoteExactInputSingle'](
			tokenIn.address,
			tokens['WETH'],
			pools[0].fee,
			toTransferAmountIn
				.sub(toSwapAmountInToWETH)
				.mul(950)
				.div(1000)
				.toHexString(),
			0 // sqrtPriceLimitX96
		)
	}

	if (!toTransferAmountIn.isZero()) {
		txns.push({
			identityContract: identityAddr,
			to: formAsset,
			feeTokenAddr,
			data: ERC20.encodeFunctionData('transfer', [
				WalletZapper.address,
				toTransferAmountIn.toHexString(),
			]),
		})
	}

	if (!toSwapAmountInToWETH.isZero()) {
		const toWETHAmountOut = await UniSwapQuoterV3['quoteExactInputSingle'](
			tokenIn.address,
			tokens['WETH'],
			pools[0].fee,
			toSwapAmountInToWETH.toHexString(),
			0 // sqrtPriceLimitX96
		)

		// TODO: trade + slippage

		txns.push({
			identityContract: identityAddr,
			to: WalletZapper.address,
			feeTokenAddr,
			data: ZapperInterface.encodeFunctionData('tradeV3Single', [
				UniSwapRouterV3.address,
				[
					formAsset,
					wethIn.address,
					pools[0].fee,
					identityAddr,
					deadline,
					toSwapAmountInToWETH.toHexString(),
					toWETHAmountOut
						.mul(950)
						.div(1000)
						.toHexString(),
					// poolState.sqrtPriceX96,
					0,
				],
			]),
		})
	}

	const diversificationAssetsToDiversify = [...diversificationAssets].filter(
		x => x.address !== formAsset && x.address !== tokens['WETH']
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

			const tokenOut = getUniToken({
				address: asset.address,
				tokenData: to,
			})

			const flattedShare = Math.round(
				(asset.share * 10 * 1000) / (diversificationsSharesLeft * 10)
			)

			const amountIn = BigNumber.from(wethAmountIn)
				.mul(flattedShare)
				.div(1000)

			const amountOut = await UniSwapQuoterV3['quoteExactInputSingle'](
				wethIn.address,
				tokenOut.address,
				pool.fee,
				amountIn.toHexString(),
				0 // sqrtPriceLimitX96
			)

			const fromTokenCurrencyAmount = CurrencyAmount.fromRawAmount(
				wethIn,
				amountIn
			)

			const toTokenCurrencyAmount = CurrencyAmount.fromRawAmount(
				tokenOut,
				amountOut
			)

			const route = await getUniv3Route({
				pools,
				tokenIn: wethIn,
				tokenOut,
				provider,
			})

			const trade = TradeV3.createUncheckedTrade({
				route,
				inputAmount: fromTokenCurrencyAmount,
				outputAmount: toTokenCurrencyAmount,
				tradeType: TradeType.EXACT_INPUT,
			})

			const amountOutMin = trade.minimumAmountOut(new Percent(5, 1000))
			return [
				asset.address,
				pool.fee,
				Math.round(flattedShare),
				utils.parseUnits(amountOutMin.toSignificant(), to.decimals).toString(),
				false,
			]
		})
	)

	// .filter(x => !!x)

	const diversificationsAllocated = diversificationTrades.reduce(
		(sum, x) => sum + x[2],
		0
	)

	if (diversificationsAllocated !== 1000) {
		throw new Error('diversificationsAllocated not 1000')
	}

	const args = [
		UniSwapRouterV3.address,
		formAsset,
		formAsset !== tokens['WETH'] ? pools[0].fee : 0x0, // inputFee
		wethAmountIn.toString(), //inputMinOut.toString(),
		diversificationTrades,
	]

	console.log('args', args)

	txns.push({
		identityContract: identityAddr,
		to: WalletZapper.address,
		feeTokenAddr,
		data: ZapperInterface.encodeFunctionData('diversifyV3', args),
	})

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
			spendTokenAddr: from.address,
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
