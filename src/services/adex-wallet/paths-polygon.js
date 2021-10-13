import { getTokens, getAssets } from './assets'
import { contractsAddressesByNetwork } from 'services/smart-contracts/contractsCfgByNetwork'

export const uniswapRouters = {
	uniV2: contractsAddressesByNetwork.polygon.swapRouterV2,
	// uniV3:
	// 	process.env.UNISWAP_ROUTER_V3 ||
	// 	'0xE592427A0AEce92De3Edee1F18E0157C05861564',
}

/**
 * The default factory enabled fee amounts, denominated in hundredths of bips.
 */
export const FeeAmount = {
	LOW: 500,
	MEDIUM: 3000,
	HIGH: 10000,
}

/**
 * The default factory tick spacings by fee amount.
 */
export const TICK_SPACINGS = {
	[FeeAmount.LOW]: 10,
	[FeeAmount.MEDIUM]: 60,
	[FeeAmount.HIGH]: 200,
}

const getWethPathsUniV3 = tokens => ({
	[tokens.USDC]: {
		fee: FeeAmount.MEDIUM,
	},
	[tokens.WBTC]: {
		fee: FeeAmount.MEDIUM,
	},
	[tokens.WETH]: {
		fee: FeeAmount.MEDIUM,
	},
})

const getWethPathsUniV2 = tokens => ({
	[tokens.MATIC]: true,
	[tokens.WMATIC]: true,
	[tokens.USDC]: true,
	[tokens.USDT]: true,
})

const getDirectPaths = tokens => ({})

function getDirectPathData({ from, to, router, reverse, fee }) {
	if (router === 'uniV2') {
		return {
			router,
			path: reverse ? [to, from] : [from, to],
		}
	} else if (router === 'uniV3') {
		return {
			router,
			pools: [
				{
					addressTokenA: from,
					addressTokenB: to,
					fee,
				},
			],
			poolsPath: reverse ? [to, from] : [from, to],
		}
	}
}

function getDirectPath({ from, to, tokens }) {
	const directPaths = getDirectPaths(tokens)
	const match =
		directPaths[from] && directPaths[from][to]
			? directPaths[from][to]
			: directPaths[to] && directPaths[to][from]
			? { ...directPaths[to][from], reverse: true }
			: null

	if (match) {
		return getDirectPathData({ from, to, ...match })
	} else {
		return false
	}
}

// TODO: Check it dynamically:
// - check all combinations token in/out  fee
// - check for existing pools
// - Get best price

function getWETHPath({ from, to, uniV3Only, tokens }) {
	const wethPathsUniV3 = getWethPathsUniV3(tokens)
	const fromToWETH_V3 = wethPathsUniV3[from]
	const toToWETH_V3 = wethPathsUniV3[to]
	const isToWETH = tokens.WETH === to
	const isFromWETH = tokens.WETH === from

	const path = [
		from,
		...(isFromWETH ? [] : [tokens.WETH]),
		...(isToWETH ? [] : [to]),
	]

	if ((isFromWETH || fromToWETH_V3) && (toToWETH_V3 || isToWETH)) {
		return {
			router: 'uniV3',
			pools: isFromWETH
				? [
						{
							addressTokenA: to,
							addressTokenB: tokens.WETH,
							fee: toToWETH_V3.fee,
						},
				  ]
				: isToWETH
				? [
						{
							addressTokenA: from,
							addressTokenB: tokens.WETH,
							fee: fromToWETH_V3.fee,
						},
				  ]
				: [
						{
							addressTokenA: from,
							addressTokenB: tokens.WETH,
							fee: fromToWETH_V3.fee,
						},
						{
							addressTokenA: to,
							addressTokenB: tokens.WETH,
							fee: toToWETH_V3.fee,
						},
				  ],

			poolsPath: path,
		}
	}

	if (!uniV3Only) {
		const fromToWETH_V2 = getWethPathsUniV2(tokens)[from]
		const toToWETH_V2 = getWethPathsUniV2(tokens)[to]

		if (fromToWETH_V2 && (toToWETH_V2 || isToWETH)) {
			return {
				router: 'uniV2',
				path,
			}
		}
	}

	return false
}

export function getPath({ from, to, uniV3Only }) {
	const assets = getAssets()
	const tokens = getTokens()
	const directPath = getDirectPath({ from, to, tokens })
	if (directPath && (!uniV3Only || directPath.router === 'uniV3')) {
		return directPath
	}

	const WETHThroughPath = getWETHPath({ from, to, uniV3Only, tokens })

	if (WETHThroughPath) {
		return WETHThroughPath
	} else {
		const fromSymbol = assets[from] ? assets[from].symbol : from
		const toSymbol = assets[to] ? assets[to].symbol : to
		throw new Error(
			`Router and path not found from ${fromSymbol} to ${toSymbol}`
		)
	}
}

export const polygonPathsData = {
	getPath,
	TICK_SPACINGS,
	FeeAmount,
	uniswapRouters,
}
