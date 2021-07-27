import { tokens } from 'services/adex-wallet/assets'

export const diversificationPresets = [
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
