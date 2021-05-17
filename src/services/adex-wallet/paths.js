import tokens from './assets'

export const phats = {
	[tokens.WETH]: {
		[tokens.UNI]: {
			router: 'uniV2',
			path: [tokens.WETH, tokens.UNI],
		},
		[tokens.ADX]: {
			router: 'uniV3',
			path: [tokens.WETH, tokens.UNI],
		},
	},
}
