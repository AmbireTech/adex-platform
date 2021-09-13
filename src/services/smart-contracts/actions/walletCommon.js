import {
	assets,
	getPath,
	// uniswapRouters,
	tokens,
	isETHBasedToken,
} from 'services/adex-wallet'
import { getEthers } from 'services/smart-contracts/ethers'
import {
	utils,
	Contract,
	BigNumber,
	//   BigNumber
} from 'ethers'
import { contracts } from 'services/smart-contracts/contractsCfg'
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
	ON_CHAIN_ACTIONS,
	// getWalletIdentityTxnsWithNoncesAndFees,
	// getWalletIdentityTxnsTotalFees,
	// processExecuteWalletTxns,
	// getWalletApproveTxns,
} from './walletIdentity'
const ZERO = BigNumber.from(0)

const UNI_V3_FACTORY_ADDR = '0x1F98431c8aD98523631AE4a59f267346ea31F984'
const SIGNIFICANT_DIGITS = 6

const { Interface, parseUnits } = utils

const ZapperInterface = new Interface(contracts.WalletZapper.abi)
const ERC20 = new Interface(contracts.ERC20.abi)
const AaveLendingPool = new Interface(contracts.AaveLendingPool.abi)
const WETH = new Interface(contracts.WETH.abi)

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
	const toAssetTradableAddr = isETHBasedToken({ address: toAsset })
		? tokens['WETH']
		: toAsset

	const {
		// UniSwapRouterV2,
		provider,
		UniSwapQuoterV3,
	} = await getEthers(AUTH_TYPES.READONLY)

	const { path, router, pools } = await getPath({
		from: fromAssetTradableAddr,
		to: toAssetTradableAddr,
		uniV3Only,
	})

	if (uniV3Only && router !== 'uniV3') {
		throw new Error(
			`getTradeOutData uniV3 call but selected router is ${router}`
		)
	}

	const from = assets[fromAssetTradableAddr]
	const to = assets[toAssetTradableAddr]

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

		const routeTokens = trade.route.path.map(x =>
			x.symbol === 'WETH' ? 'ETH' : x.symbol
		)

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

export function txnsUnwrapAAVEInterestToken({
	feeTokenAddr,
	underlyingAssetAddr,
	amount,
	withdrawToAddr,
	identityAddr,
}) {
	const txns = []
	const unwrapTx = {
		identityContract: identityAddr,
		feeTokenAddr,
		to: contracts.AaveLendingPool.address,
		data: AaveLendingPool.encodeFunctionData('withdraw', [
			underlyingAssetAddr,
			BigNumber.from(amount).toHexString(),
			withdrawToAddr,
		]),
		onChainActionData: {
			txAction: {
				...ON_CHAIN_ACTIONS.withdrawAAVE,
				specific: {
					token: `${assets[underlyingAssetAddr].symbol}`,
					amount: `${amount.toString()}`,
				},
			},
		},
	}

	txns.push(unwrapTx)
	return txns
}

export function txnsETHtoWETH({
	feeTokenAddr,
	addrWETH,
	amount,
	identityAddr,
}) {
	if (addrWETH !== contracts.WETH.address) {
		throw new Error('txnsETHtoWETH - WETH addr does not match')
	}
	const txns = []
	const wrapTx = {
		identityContract: identityAddr,
		feeTokenAddr,
		to: contracts.WETH.address,
		data: WETH.encodeFunctionData('deposit'),
		value: amount.toString(),
		onChainActionData: {
			txAction: {
				...ON_CHAIN_ACTIONS.depositWETH,
				specific: {
					amount: `${amount.toString()}`,
				},
			},
		},
	}

	txns.push(wrapTx)
	return txns
}

export function txnsWETHtoETH({
	feeTokenAddr,
	addrWETH,
	amount,
	identityAddr,
}) {
	if (addrWETH !== contracts.WETH.address) {
		throw new Error('txnsETHtoWETH - WETH addr does not match')
	}
	const txns = []
	const unwrapTx = {
		identityContract: identityAddr,
		feeTokenAddr,
		to: contracts.WETH.address,
		data: WETH.encodeFunctionData('withdraw', [amount.toString()]),
		onChainActionData: {
			txAction: {
				...ON_CHAIN_ACTIONS.withdrawWETH,
				specific: {
					amount: `${amount.toString()}`,
				},
			},
		},
	}

	txns.push(unwrapTx)
	return txns
}

// TODO: assume all ETH based tokens has the same 18 decimals
export function getEthBasedTokensToWETHTxns({
	feeTokenAddr,
	identityAddr,
	amountNeeded,
	assetsDataRaw,
	// usable exchangeV2
	// return transfer to Zapper txns instead unwrap,
	getAWETHasAssetsToUnwrap,
	zapperAddress,
}) {
	const txns = []
	// const balanceWETH = assetsDataRaw[tokens.WETH].balance
	// console.log('balanceWETH', balanceWETH)

	let amountReached = BigNumber.from(assetsDataRaw[tokens.WETH].balance)

	if (BigNumber.from(amountNeeded).gte(amountReached)) {
		const otherETHBalancesSorted = [
			// {
			// 	asset: assetsDataRaw[tokens.WETH].symbol,
			// 	balance: assetsDataRaw[tokens.WETH].balance,
			// },
			{
				address: tokens.ETH,
				getTxns: amount =>
					txnsETHtoWETH({
						feeTokenAddr,
						identityAddr,
						addrWETH: tokens.WETH,
						amount,
					}),
			},
			{
				address: tokens.aWETH,
				getTxns: amount =>
					txnsUnwrapAAVEInterestToken({
						feeTokenAddr,
						underlyingAssetAddr: tokens.WETH,
						amount,
						withdrawToAddr: identityAddr,
						identityAddr,
					}),
			},
			{
				address: tokens.aETH,
				getTxns: amount => {
					const aETHtoWETHtxns = []
					// 1. - aETH to ETH to identity
					// TODO: param send to identity or zapper
					aETHtoWETHtxns.push(
						...txnsUnwrapAAVEInterestToken({
							feeTokenAddr,
							// Hope it works that way for ETH
							// https://etherscan.io/address/0x3a3a65aab0dd2a17e3f1947ba16138cd37d08c04#readContract
							// aETH underlyingAssetAddress  0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee as tokens['ETH']
							underlyingAssetAddr: tokens.ETH,
							amount,
							withdrawToAddr: identityAddr,
							identityAddr,
						})
					)
					// TODO: getAWETHasAssetsToUnwrap, zapperAddress,...
					//
					// 2. wrap toWETH
					aETHtoWETHtxns.push(
						...txnsETHtoWETH({
							feeTokenAddr,
							identityAddr,
							addrWETH: tokens.WETH,
							amount,
						})
					)

					return aETHtoWETHtxns
				},
			},
		]
			.filter(x => x.address)
			.map(x => ({
				...x,
				balance: assetsDataRaw[x.address].balance,
			}))
			.sort((a, b) =>
				BigNumber.from(a.balance).lt(b.balance)
					? -1
					: BigNumber.from(a.balance).gte(b.balance)
					? 1
					: 0
			)

		for (const balanceData of otherETHBalancesSorted) {
			const {
				balance,
				// address,
				// symbol,
				getTxns,
				//  decimals
			} = balanceData

			const amountNeededLeft = amountNeeded.sub(amountReached)

			const amount = amountNeededLeft.gt(balance) ? balance : amountNeededLeft

			const dataTxns = getTxns(amount)
			txns.push(...dataTxns)
			amountReached = amountReached.add(amount)

			if (amountReached.gte(amountNeeded)) {
				break
			}
		}
	}

	return txns
}

// TODO: assume all ETH based tokens has the same 18 decimals
export function getEthBasedTokensToETHTxns({
	feeTokenAddr,
	identityAddr,
	amountNeeded,
	assetsDataRaw,
}) {
	const txns = []
	// const balanceWETH = assetsDataRaw[tokens.WETH].balance
	// console.log('balanceWETH', balanceWETH)

	let amountReached = BigNumber.from(assetsDataRaw[tokens.ETH].balance)

	if (BigNumber.from(amountNeeded).gte(amountReached)) {
		const otherETHBalancesSorted = [
			// {
			// 	asset: assetsDataRaw[tokens.WETH].symbol,
			// 	balance: assetsDataRaw[tokens.WETH].balance,
			// },
			{
				address: tokens.WETH,
				getTxns: amount =>
					txnsWETHtoETH({
						feeTokenAddr,
						identityAddr,
						addrWETH: tokens.WETH,
						amount,
					}),
			},
			{
				address: tokens.aWETH,
				getTxns: amount => {
					// txnsUnwrapAAVEInterestToken({
					// 	feeTokenAddr,
					// 	underlyingAssetAddr: tokens.WETH,
					// 	amount,
					// 	withdrawToAddr: identityAddr,
					// 	identityAddr,
					// }),
					const aWETHtoETHtxns = []
					// 1. - aWETH to WETH to identity
					// TODO: param send to identity or zapper
					aWETHtoETHtxns.push(
						...txnsUnwrapAAVEInterestToken({
							underlyingAssetAddr: tokens.WETH,
							amount,
							withdrawToAddr: identityAddr,
							identityAddr,
						})
					)
					// TODO: getAWETHasAssetsToUnwrap, zapperAddress,...
					//
					// 2. unwrap to ETH
					aWETHtoETHtxns.push(
						...txnsWETHtoETH({
							feeTokenAddr,
							identityAddr,
							addrWETH: tokens.WETH,
							amount,
						})
					)

					return aWETHtoETHtxns
				},
			},
			{
				address: tokens.aETH,
				getTxns: amount =>
					txnsUnwrapAAVEInterestToken({
						feeTokenAddr,
						underlyingAssetAddr: tokens.ETH,
						amount,
						withdrawToAddr: identityAddr,
						identityAddr,
					}),
			},
		]
			.filter(x => x.address)
			.map(x => ({
				...x,
				balance: assetsDataRaw[x.address].balance,
			}))
			.sort((a, b) =>
				a.balance.lt(b.balance) ? -1 : a.balance.gte(b.balance) ? 1 : 0
			)

		for (const balanceData of otherETHBalancesSorted) {
			const {
				balance,
				// address,
				// symbol,
				getTxns,
				//  decimals
			} = balanceData

			const amountNeededLeft = amountNeeded.sub(amountReached)

			const amount = amountNeededLeft.gt(balance) ? balance : amountNeededLeft
			const dataTxns = getTxns(amount)
			txns.push(...dataTxns)
			amountReached = amountReached.add(amount)

			if (amountReached.gte(amountNeeded)) {
				break
			}
		}
	}

	return txns
}

export function aaveUnwrapTokenAmount({
	underlyingAssetAddr,
	amountNeeded,
	assetsDataRaw,
}) {
	const underlyingAssetTotalAvailable = BigNumber.from(
		assetsDataRaw[underlyingAssetAddr].totalAvailable
	)
	if (amountNeeded.gt(underlyingAssetTotalAvailable)) {
		throw new Error(
			`aaveUnwrapToken Insufficient balance ${underlyingAssetAddr}`
		)
	}

	const underlyingAssetBalance = BigNumber.from(
		assetsDataRaw[underlyingAssetAddr].balance
	)

	if (underlyingAssetBalance.lt(amountNeeded)) {
		return amountNeeded.sub(underlyingAssetBalance)
	} else {
		return ZERO
	}
}

export function getAAVEInterestTokenAddr({ underlyingAssetAddr }) {
	const symbol = assets[underlyingAssetAddr].symbol
	// TODO: make it better
	const aaveInterestTokenAddr = tokens[`a${symbol}`]
	if (!aaveInterestTokenAddr) {
		throw new Error('getAAVEInterestTokenAddr - AAVE interest token not found')
	}
	return aaveInterestTokenAddr
}
