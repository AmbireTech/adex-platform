import { contracts } from 'services/smart-contracts/contractsCfg.js'
import ADX_LOGO from 'resources/token-logos/ADX.png'
// import WETH_LOGO from 'resources/token-logos/WETH.png'
// import WBTC_LOGO from 'resources/token-logos/WBTC.png'
// import USDT_LOGO from 'resources/token-logos/USDT.png'
import USDC_LOGO from 'resources/token-logos/USDC.png'
import WBTC_LOGO from 'resources/token-logos/WBTC.png'
import ETH_LOGO from 'resources/token-logos/ETH.png'
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
	ETH: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
	// aETH: '0x3a3A65aAb0dd2A17E3F1947bA16138cd37d08c04',
	WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	aWETH: '0x030bA81f1c18d280636F32af80b9AAd02Cf0854e',
	// USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
	USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
	WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
	[ADXToken.symbol]: ADXToken.address,
	// [StakingPool.symbol]: StakingPool.address,
	// [ADXLoyaltyPoolToken.symbol]: ADXLoyaltyPoolToken.address,
}

const logos = {
	[tokens.ETH]: ETH_LOGO,
	[ADXToken.address]: ADX_LOGO,
	[ADXLoyaltyPoolToken.address]: ADX_LOGO,
	[StakingPool.address]: ADX_LOGO,
	[tokens.USDC]: USDC_LOGO,
	[tokens.WETH]: WETH_LOGO,
	[tokens.WBTC]: WBTC_LOGO,
}

const assets = {
	[tokens.ETH]: {
		symbol: 'ETH',
		name: 'Ethereum',
		getBalance: async function({ address }) {
			return await getETHBalance({ address })
		},
		isETH: true,
		isSwappable: true,
		isBaseAsset: true,
		// subAssets: [ADXLoyaltyPoolToken.address, StakingPool.address],
		// subAssets: [tokens.WETH, tokens.aWETH],
		subAssets: [tokens.WETH],
		decimals: 18,
	},
	// [tokens.aETH]: {
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
		name: 'Wrapped ETH',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.WETH, address })
		},
		isWrappedETH: true,
		isSwappable: false,
		isBaseAsset: false,
		mainAssetSymbol: 'ETH',
		mainAssetAddr: tokens.ETH,
		// subAssets: [tokens.aWETH],
		subAssets: [],
		decimals: 18,
	},
	[tokens.aWETH]: {
		symbol: 'aWETH',
		name: 'Aave interest bearing WETH',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.aWETH, address })
		},
		isSwappable: false,
		isBaseAsset: false,
		mainAssetSymbol: 'ETH',
		isAaveInterestToken: true,
		subAssets: [],
		decimals: 18,
		logoSrc: ETH_LOGO,
	},
	[ADXToken.address]: {
		symbol: ADXToken.symbol,
		name: 'AdEx Network',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: ADXToken.address, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		// subAssets: [ADXLoyaltyPoolToken.address, StakingPool.address],
		subAssets: [],
		decimals: ADXToken.decimals,
	},
	// [ADXLoyaltyPoolToken.address]: {
	// 	symbol: ADXLoyaltyPoolToken.symbol,
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
		name: 'USD Coin',
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
	[tokens.WBTC]: {
		symbol: 'WBTC',
		name: 'Wrapped BTC',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.WBTC, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		// subAssets: [tokens.aWBTC],
		subAssets: [],
		decimals: 8,
		logoSrc: WBTC_LOGO,
		isStableCoin: true,
	},
}

const mappers = {
	// 	[ADXLoyaltyPoolToken.address]: mapADXLoyaltyPoolToken.bind(null),
	// 	[StakingPool.address]: mapADXStakingPoolToken.bind(null),
	// 	[tokens.aUSDT]: mapAAVEInterestToken.bind(null, assets[tokens.USDT].symbol),
	[tokens.aWETH]: mapAAVEInterestToken.bind(null, assets[tokens.WETH].symbol),
	// 	[tokens.aDAI]: mapAAVEInterestToken.bind(null, assets[tokens.DAI].symbol),
	// 	[tokens.aLINK]: mapAAVEInterestToken.bind(null, assets[tokens.LINK].symbol),
	[tokens.WETH]: mapWrappedETH.bind(null, assets[tokens.ETH].symbol),
	// [tokens.aETH]: mapAAVEInterestToken.bind(null, assets[tokens.aETH].symbol),
}

export const assetsMainnet = {
	tokens,
	assets,
	mappers,
	logos,
}
