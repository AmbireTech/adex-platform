import { getTokens } from 'services/adex-wallet/assets'
import { selectNetwork } from 'selectors'

const ethereum = tokens => [
	{
		label: 'DIV_PRESET_CONSERVATIVE',
		assets: [
			{
				address: tokens.USDC,
				share: 70,
			},
			{
				address: tokens.WBTC,
				share: 30,
			},
		],
	},
	{
		label: 'DIV_PRESET_DEGEN',
		assets: [
			{
				address: tokens.USDC,
				share: 50,
			},
			{
				address: tokens.WBTC,
				share: 25,
			},
			{
				address: tokens.WETH,
				share: 25,
			},
		],
	},
	{
		label: 'DIV_PRESET_RISKY',
		assets: [
			{
				address: tokens.WETH,
				share: 69,
			},
			{
				address: tokens.WBTC,
				share: 31,
			},
		],
	},
]

export const kovan = tokens => [
	{
		label: 'DIV_PRESET_CONSERVATIVE',
		assets: [
			{
				address: tokens.USDT,
				share: 40,
			},
			{
				address: tokens.DAI,
				share: 30,
			},
			{
				address: tokens.WETH,
				share: 30,
			},
			// {
			// 	address: tokens.ADX,
			// 	share: 10,
			// },
		],
	},
	{
		label: 'DIV_PRESET_DEGEN',
		assets: [
			{
				address: tokens.WETH,
				share: 80,
			},
			// {
			// 	address: tokens.ADX,
			// 	share: 40,
			// },
			// {
			// 	address: tokens.UNI,
			// 	share: 20,
			// },
			{
				address: tokens.USDT,
				share: 20,
			},
		],
	},
	{
		label: 'DIV_PRESET_RISKY',
		assets: [
			{
				address: tokens.WETH,
				share: 70,
			},
			// {
			// 	address: tokens.ADX,
			// 	share: 30,
			// },
			{
				address: tokens.USDT,
				share: 30,
			},
		],
	},
]

const diversificationsByNetwork = {
	ethereum,
	kovan,
}

export const getDiversificationPresets = () => {
	const { id } = selectNetwork()
	const tokens = getTokens()

	return diversificationsByNetwork[id](tokens) || []
}
// process.env.NODE_ENV === 'production' ? mainnet : kovan
