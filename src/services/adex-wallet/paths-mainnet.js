import { tokens, assets } from './assets'

export const uniswapRouters = {
	uniV2:
		process.env.UNISWAP_ROUTER_V2 ||
		'0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
	uniV3:
		process.env.UNISWAP_ROUTER_V3 ||
		'0xE592427A0AEce92De3Edee1F18E0157C05861564',
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

const wethPathsUniV3 = {
	[tokens.USDC]: {
		fee: FeeAmount.MEDIUM,
	},
	[tokens.WBTC]: {
		fee: FeeAmount.MEDIUM,
	},
	[tokens.WETH]: {
		fee: FeeAmount.MEDIUM,
	},
}

const wethPathsUniV2 = {
	[tokens.ADX]: true,
	[tokens.USDC]: true,
	[tokens.WBTC]: true,
	[tokens.WETH]: true,
}

const directPaths = {}

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

function getDirectPath({ from, to }) {
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

function getWETHPath({ from, to, uniV3Only }) {
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
		const fromToWETH_V2 = wethPathsUniV2[from]
		const toToWETH_V2 = wethPathsUniV2[to]

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
	const directPath = getDirectPath({ from, to })
	if (directPath && (!uniV3Only || directPath.router === 'uniV3')) {
		return directPath
	}

	const WETHThroughPath = getWETHPath({ from, to, uniV3Only })

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

export const mainnetPathsData = {
	getPath,
	TICK_SPACINGS,
	FeeAmount,
	uniswapRouters,
}
