import { tokens } from './assets'

export const uniswapRouters = {
	uniV2: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
	uniV3: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
}

export const paths = {
	[tokens.WETH]: {
		[tokens.UNI]: {
			router: 'uniV2',
			path: [tokens.WETH, tokens.UNI],
		},
		[tokens.ADX]: {
			router: 'uniV3',
			path: [tokens.WETH, tokens.UNI],
		},
		[tokens.USDT]: {
			router: 'uniV3',
			path: [tokens.WETH, tokens.USDT],
		},
	},
	[tokens.ADX]: {
		[tokens.UNI]: {
			router: 'uniV2',
			path: [tokens.ADX, tokens.WETH, tokens.UNI],
		},
	},
}

export async function getPath({ from, to }) {
	// TODO: check paths

	if (paths[from] && paths[from][to]) {
		return paths[from][to]
	} else if (paths[to] && paths[to][from]) {
		const reversePath = paths[to][from]

		return {
			...reversePath,
			path: [...reversePath.path].reverse(),
		}
	} else {
		throw new Error('Router and path not found')
	}
}
