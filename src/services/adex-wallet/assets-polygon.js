import { contracts } from 'services/smart-contracts/contractsCfg.js'
import ADX_LOGO from 'resources/token-logos/ADX.png'
// import WETH_LOGO from 'resources/token-logos/WETH.png'
// import WBTC_LOGO from 'resources/token-logos/WBTC.png'
import USDT_LOGO from 'resources/token-logos/USDT.png'
import USDC_LOGO from 'resources/token-logos/USDC.png'
import WBTC_LOGO from 'resources/token-logos/WBTC.png'
import ETH_LOGO from 'resources/token-logos/ETH.png'
import MATIC_LOGO from 'resources/token-logos/MATIC.png'
import WMATIC_LOGO from 'resources/token-logos/WMATIC.webp'
import WETH_LOGO from 'resources/token-logos/WETH.png'
// import ADX_WALLET_LOGO from 'resources/wallet/logo.png'
// import UNI_LOGO from 'resources/token-logos/UNI.png'
// import DAI_LOGO from 'resources/token-logos/DAI.svg'
// import LINK_LOGO from 'resources/token-logos/LINK.png'
// import BTC_LOGO from 'resources/token-logos/BTC.png'
import {
	getERC20Balance,
	getETHBalance,
	mapWrappedETH,
	mapAAVEInterestToken,
	// mapADXLoyaltyPoolToken,
	// mapADXStakingPoolToken,
	// getAdxToken,
	// getADXLoyaltyPoolToken,
	// getADXStakingPoolToken,
	// getLogoCommon,
} from './assets-common'
const {
	ADXLoyaltyPoolToken,
	StakingPool,
	ADXToken,
	// ERC20,
} = contracts

// 0xe0fba4fc209b4948668006b2be61711b7f465bae // lending proxy
// lending - 0x2646FcF7F0AbB1ff279ED9845AdE04019C907EBE
// 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
// 0xE592427A0AEce92De3Edee1F18E0157C05861564

const tokens = {
	MATIC: '0x7D1AfA7B718fb893dB30A3aBc0Cfc608AaCfeBB0',
	WMATIC: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
	// aETH: '0x3a3A65aAb0dd2A17E3F1947bA16138cd37d08c04',
	WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
	// aWETH: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
	// USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
	USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
	USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
	// aUSDC: '0xBcca60bB61934080951369a648Fb03DF4F96263C',
	// WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
	// [ADXToken.symbol]: ADXToken.address,
	// [StakingPool.symbol]: StakingPool.address,
	// [ADXLoyaltyPoolToken.symbol]: ADXLoyaltyPoolToken.address,
}

const logos = {
	[tokens.MATIC]: MATIC_LOGO,
	[tokens.WMATIC]: WMATIC_LOGO,
	// [ADXToken.address]: ADX_LOGO,
	// [ADXLoyaltyPoolToken.address]: ADX_LOGO,
	// [StakingPool.address]: ADX_LOGO,
	[tokens.USDC]: USDC_LOGO,
	[tokens.WETH]: WETH_LOGO,
	[tokens.WBTC]: WBTC_LOGO,
}

const assets = {
	[tokens.MATIC]: {
		address: tokens.MATIC,
		symbol: 'MATIC',
		name: 'Polygon',
		getBalance: async function({ address }) {
			// return await getETHBalance({ address })
			return await getETHBalance({ address })
		},
		isETH: true,
		isSwappable: true,
		isBaseAsset: true,
		subAssets: [tokens.WMATIC],
		decimals: 18,
	},
	[tokens.WMATIC]: {
		symbol: 'WMATIC',
		address: tokens.WMATIC,
		name: 'Wrapped MATIC',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.WMATIC, address })
		},
		// isWrappedETH: true,
		isSwappable: true,
		isBaseAsset: true,
		// mainAssetSymbol: 'ETH',
		// mainAssetAddr: tokens.ETH,
		// subAssets: [tokens.aWETH],
		subAssets: [],
		decimals: 18,
	},
	// [tokens.aETH]: {
	//	address: tokens.aETH,
	// 	symbol: 'aETH',
	// 	name: 'Aave interest bearing ETH',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({ tokenAddress: tokens.aETH, address })
	// 	},
	// 	isSwappable: false,
	// 	isBaseAsset: false,
	// 	mainAssetSymbol: 'ETH',
	// 	isAaveInterestToken: true,
	// 	subAssets: [],
	// 	decimals: 18,
	// 	logoSrc: ETH_LOGO,
	// },
	[tokens.WETH]: {
		symbol: 'WETH',
		address: tokens.WETH,
		name: 'Wrapped ETH',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.WETH, address })
		},
		// isWrappedETH: true,
		isSwappable: true,
		isBaseAsset: true,
		// mainAssetSymbol: 'ETH',
		// mainAssetAddr: tokens.ETH,
		// subAssets: [tokens.aWETH],
		subAssets: [],
		decimals: 18,
	},
	[tokens.WETH]: {
		symbol: 'WETH',
		address: tokens.WETH,
		name: 'Wrapped ETH',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.WETH, address })
		},
		// isWrappedETH: true,
		isSwappable: true,
		isBaseAsset: true,
		// mainAssetSymbol: 'ETH',
		// mainAssetAddr: tokens.ETH,
		// subAssets: [tokens.aWETH],
		subAssets: [],
		decimals: 18,
	},
	// [tokens.aWETH]: {
	// 	symbol: 'aWETH',
	// 	address: tokens.aWETH,
	// 	name: 'Aave interest bearing WETH',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({ tokenAddress: tokens.aWETH, address })
	// 	},
	// 	isSwappable: false,
	// 	isBaseAsset: false,
	// 	mainAssetSymbol: 'ETH',
	// 	isAaveInterestToken: true,
	// 	subAssets: [],
	// 	decimals: 18,
	// 	logoSrc: ETH_LOGO,
	// },
	// [ADXToken.address]: {
	// 	symbol: ADXToken.symbol,
	// 	address: ADXToken.address,
	// 	name: 'AdEx Network',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({ tokenAddress: ADXToken.address, address })
	// 	},
	// 	isSwappable: true,
	// 	isBaseAsset: true,
	// 	// subAssets: [ADXLoyaltyPoolToken.address, StakingPool.address],
	// 	subAssets: [],
	// 	decimals: ADXToken.decimals,
	// },
	// [ADXLoyaltyPoolToken.address]: {
	// 	symbol: ADXLoyaltyPoolToken.symbol,
	//  address: ADXLoyaltyPoolToken.address,
	// 	name: 'AdEx Loyalty pool',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({
	// 			tokenAddress: ADXLoyaltyPoolToken.address,
	// 			address,
	// 		})
	// 	},
	// 	isSwappable: true,
	// 	isBaseAsset: false,
	// 	subAssets: [],
	// 	decimals: ADXLoyaltyPoolToken.decimals,
	// 	logoSrc: ADX_LOGO,
	// },
	// [StakingPool.address]: {
	// 	symbol: StakingPool.symbol,
	//  address: StakingPool.address,
	// 	name: 'AdEx Staking pool',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({
	// 			tokenAddress: StakingPool.address,
	// 			address,
	// 		})
	// 	},
	// 	isSwappable: true,
	// 	isBaseAsset: false,
	// 	subAssets: [],
	// 	decimals: StakingPool.decimals,
	// 	logoSrc: ADX_LOGO,
	// },
	// [tokens.USDT]: {
	// 	symbol: 'USDT',
	//  address: tokens.USDT,
	// 	name: 'Tether',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({ tokenAddress: tokens.USDT, address })
	// 	},
	// 	isSwappable: true,
	// 	isBaseAsset: true,
	// 	// subAssets: [tokens.aUSDT],
	// 	subAssets: [],
	// 	decimals: 6,
	// 	logoSrc: USDT_LOGO,
	// 	isStableCoin: true,
	// },
	// [tokens.aUSDT]: {
	// 	symbol: 'aUSDT',
	//  address: tokens.aUSDT,
	// 	name: 'Aave interest bearing USDT',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({ tokenAddress: tokens.aUSDT, address })
	// 	},
	// 	isSwappable: false,
	// 	isBaseAsset: false,
	// 	isAaveInterestToken: true,
	// 	subAssets: [],
	// 	decimals: 6,
	// 	logoSrc: USDT_LOGO,
	// },
	[tokens.USDC]: {
		symbol: 'USDC',
		address: tokens.USDC,
		name: 'USD Coin (PoS)',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.USDC, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		// subAssets: [tokens.aUSDC],
		subAssets: [],
		decimals: 6,
		logoSrc: USDC_LOGO,
		isStableCoin: true,
	},
	// [tokens.aUSDC]: {
	// 	symbol: 'aUSDC',
	// 	address: tokens.aUSDC,
	// 	name: 'Aave interest bearing USDC',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({ tokenAddress: tokens.aUSDC, address })
	// 	},
	// 	isSwappable: false,
	// 	isBaseAsset: false,
	// 	mainAssetSymbol: 'USDC',
	// 	isAaveInterestToken: true,
	// 	subAssets: [],
	// 	decimals: 6,
	// 	logoSrc: USDC_LOGO,
	// },
	// [tokens.WBTC]: {
	// 	symbol: 'WBTC',
	// 	address: tokens.WBTC,
	// 	name: 'Wrapped BTC',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({ tokenAddress: tokens.WBTC, address })
	// 	},
	// 	isSwappable: true,
	// 	isBaseAsset: true,
	// 	// subAssets: [tokens.aWBTC],
	// 	subAssets: [],
	// 	decimals: 8,
	// 	logoSrc: WBTC_LOGO,
	// 	isStableCoin: true,
	// },
	[tokens.USDT]: {
		symbol: 'USDT',
		address: tokens.USDT,
		name: '(PoS) Tether USD',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.USDT, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		// subAssets: [tokens.aUSDC],
		subAssets: [],
		decimals: 6,
		logoSrc: USDT_LOGO,
		isStableCoin: true,
	},
}

const mappers = {
	// 	[ADXLoyaltyPoolToken.address]: mapADXLoyaltyPoolToken.bind(null),
	// 	[StakingPool.address]: mapADXStakingPoolToken.bind(null),
	// 	[tokens.aUSDT]: mapAAVEInterestToken.bind(null, assets[tokens.USDT].symbol),
	// [tokens.aWETH]: mapAAVEInterestToken.bind(null, assets[tokens.WETH].symbol),
	// 	[tokens.aDAI]: mapAAVEInterestToken.bind(null, assets[tokens.DAI].symbol),
	// 	[tokens.aLINK]: mapAAVEInterestToken.bind(null, assets[tokens.LINK].symbol),
	// [tokens.WETH]: mapWrappedETH.bind(null, assets[tokens.ETH].symbol),
	// [tokens.aETH]: mapAAVEInterestToken.bind(null, assets[tokens.aETH].symbol),
}

export const polygon = {
	tokens,
	assets,
	mappers,
	logos,
}
