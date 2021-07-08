import { tokens } from './assets'

export const uniswapRouters = {
	uniV2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
	uniV3: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
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

export const paths = {
	[tokens.WETH]: {
		[tokens.UNI]: {
			router: 'uniV2',
			path: [tokens.WETH, tokens.UNI],
		},
		[tokens.ADX]: {
			router: 'uniV3',
			pools: [
				{
					addressTokenA: tokens.ADX,
					addressTokenB: tokens.WETH,
					fee: FeeAmount.MEDIUM,
				},
			],
			poolsPath: [tokens.WETH, tokens.ADX],
		},
		[tokens.USDT]: {
			router: 'uniV3',
			pools: [
				{
					addressTokenA: tokens.USDT,
					addressTokenB: tokens.WETH,
					fee: FeeAmount.LOW,
				},
			],
			poolsPath: [tokens.WETH, tokens.USDT],
		},
		[tokens.DAI]: {
			router: 'uniV3',
			pools: [
				{
					addressTokenA: tokens.DAI,
					addressTokenB: tokens.WETH,
					fee: FeeAmount.LOW,
				},
			],
			poolsPath: [tokens.WETH, tokens.DAI],
		},
	},
	[tokens.ADX]: {
		[tokens.UNI]: {
			router: 'uniV2',
			path: [tokens.ADX, tokens.WETH, tokens.UNI],
		},
		[tokens.USDT]: {
			router: 'uniV3',
			pools: [
				{
					addressTokenA: tokens.ADX,
					addressTokenB: tokens.WETH,
					fee: FeeAmount.MEDIUM,
				},
				{
					addressTokenA: tokens.USDT,
					addressTokenB: tokens.WETH,
					fee: FeeAmount.LOW,
				},
			],
			poolsPath: [tokens.ADX, tokens.WETH, tokens.USDT],
		},
		[tokens.DAI]: {
			router: 'uniV3',
			pools: [
				{
					addressTokenA: tokens.ADX,
					addressTokenB: tokens.WETH,
					fee: FeeAmount.MEDIUM,
				},
				{
					addressTokenA: tokens.DAI,
					addressTokenB: tokens.WETH,
					fee: FeeAmount.LOW,
				},
			],
			poolsPath: [tokens.ADX, tokens.WETH, tokens.DAI],
		},
	},
	[tokens.UNI]: {
		[tokens.USDT]: {
			router: 'uniV3',
			pools: [
				{
					addressTokenA: tokens.UNI,
					addressTokenB: tokens.WETH,
					fee: FeeAmount.LOW,
				},
				{
					addressTokenA: tokens.USDT,
					addressTokenB: tokens.WETH,
					fee: FeeAmount.LOW,
				},
			],
			poolsPath: [tokens.UNI, tokens.WETH, tokens.USDT],
		},
		[tokens.DAI]: {
			router: 'uniV2',
			path: [tokens.UNI, tokens.WETH, tokens.DAI],
		},
	},
	[tokens.USDT]: {
		[tokens.DAI]: {
			router: 'uniV2',
			path: [tokens.USDT, tokens.DAI],
		},
	},
}

export function getPath({ from, to }) {
	// TODO: check paths

	if (
		(paths[from] && paths[from][to]) ||
		(paths[from] && paths[from][to] && paths[from][to].pools)
	) {
		return paths[from][to]
	} else if (paths[to] && paths[to][from] && paths[to][from].path) {
		const reversePath = paths[to][from]

		return {
			...reversePath,
			path: [...reversePath.path].reverse(),
		}
	} else if (paths[to] && paths[to][from] && paths[to][from].pools) {
		return {
			...paths[to][from],
			poolsPath: [...paths[to][from].poolsPath].reverse(),
		}
	} else {
		throw new Error(`Router and path not found from ${from} to ${to}`)
	}
}
