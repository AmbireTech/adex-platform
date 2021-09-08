import { contracts } from 'services/smart-contracts/contractsCfg.js'
import ADX_LOGO from 'resources/token-logos/ADX.png'
// import WETH_LOGO from 'resources/token-logos/WETH.png'
// import WBTC_LOGO from 'resources/token-logos/WBTC.png'
import USDT_LOGO from 'resources/token-logos/USDT.png'
import ETH_LOGO from 'resources/token-logos/ETH.png'
import UNI_LOGO from 'resources/token-logos/UNI.png'
import DAI_LOGO from 'resources/token-logos/DAI.svg'
import LINK_LOGO from 'resources/token-logos/LINK.png'

import {
	getERC20Balance,
	mapAAVEInterestToken,
	mapADXLoyaltyPoolToken,
	mapADXStakingPoolToken,
	getETHBalance,
	mapWrappedETH,
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
	aETH: '0x7d375837948238b45e40f0458efd608969f49efe',
	USDT: '0x13512979ade267ab5100878e2e0f485b568328a4',
	aUSDT: '0xFF3c8bc103682FA918c954E84F5056aB4DD5189d', // AAVE USDT
	WETH: '0xd0A1E359811322d97991E03f863a0C30C2cF029C',
	aWETH: '0x87b1f4cf9BD63f7BBD3eE1aD04E8F52540349347', // AAVE WETH
	UNI: '0x075A36BA8846C6B6F53644fDd3bf17E5151789DC',
	aUNI: '',
	// ADX: ADXToken.address,
	DAI: '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd', //DAI
	aDAI: '0xdCf0aF9e59C002FA3AA091a46196b37530FD48a8', // AAVE DAI
	// TST: '0x7af963cF6D228E564e2A0aA0DdBF06210B38615D',
	LINK: '0xAD5ce863aE3E4E9394Ab43d4ba0D80f419F61789',
	aLINK: '0xeD9044cA8F7caCe8eACcD40367cF2bee39eD1b04',
}

// const goerliTokens = {
// 	USDT: '0x9bc43d6dcecae49ab1939dcd733c37b476746ea0',
// 	WETH: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
// 	UNI: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
// 	ADX: ADXToken.address,
// 	DAI: '0x4bd7AB4aA37dd7450a4a75BD6e268f5c2417b855', //DAI
// 	TST: '0x7af963cF6D228E564e2A0aA0DdBF06210B38615D',
// }

const logos = {
	[ADXToken.address]: ADX_LOGO,
	[ADXLoyaltyPoolToken.address]: ADX_LOGO,
	[StakingPool.address]: ADX_LOGO,
	[tokens.USDT]: USDT_LOGO,
	[tokens.WETH]: ETH_LOGO,
	[tokens.UNI]: UNI_LOGO,
	[tokens.DAI]: DAI_LOGO,
	[tokens.LINK]: LINK_LOGO,
}

export const assets = {
	// [ADXToken.address]: {
	// 	symbol: ADXToken.symbol,
	// 	name: 'AdEx Network',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({ tokenAddress: ADXToken.address, address })
	// 	},
	// 	isSwappable: true,
	// 	isBaseAsset: true,
	// 	subAssets: [ADXLoyaltyPoolToken.address, StakingPool.address],
	// 	decimals: ADXToken.decimals,
	// 	logoSrc: ADX_LOGO,
	// },
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
	[tokens.USDT]: {
		symbol: 'USDT',
		name: 'Tether',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.USDT, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		subAssets: [tokens.aUSDT],
		decimals: 6,
		logoSrc: USDT_LOGO,
		isStableCoin: true,
	},
	[tokens.aUSDT]: {
		symbol: 'aUSDT',
		name: 'Aave interest bearing USDT',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.aUSDT, address })
		},
		isSwappable: false,
		isBaseAsset: false,
		isAaveInterestToken: true,
		subAssets: [],
		decimals: 6,
		logoSrc: USDT_LOGO,
	},
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
	[tokens.aETH]: {
		symbol: 'aETH',
		name: 'Aave interest bearing ETH',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.aETH, address })
		},
		isSwappable: false,
		isBaseAsset: false,
		mainAssetSymbol: 'ETH',
		isAaveInterestToken: true,
		subAssets: [],
		decimals: 18,
		logoSrc: ETH_LOGO,
	},
	[tokens.WETH]: {
		symbol: 'WETH',
		name: 'Wrapped Ethereum',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.WETH, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		subAssets: [tokens.aWETH],
		decimals: 18,
		logoSrc: ETH_LOGO,
	},
	[tokens.aWETH]: {
		symbol: 'aWETH',
		name: 'Aave interest bearing WETH',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.aWETH, address })
		},
		isSwappable: false,
		isBaseAsset: false,
		isAaveInterestToken: true,
		subAssets: [],
		decimals: 18,
		logoSrc: ETH_LOGO,
	},
	[tokens.UNI]: {
		symbol: 'UNI',
		name: 'Uniswap',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.UNI, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		subAssets: [],
		decimals: 18,
		logoSrc: UNI_LOGO,
	},
	[tokens.DAI]: {
		symbol: 'DAI',
		name: 'Dai',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.DAI, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		subAssets: [tokens.aDAI],
		decimals: 18,
		logoSrc: DAI_LOGO,
		isStableCoin: true,
	},
	[tokens.aDAI]: {
		symbol: 'aDAI',
		name: 'Aave interest bearing DAI',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.aDAI, address })
		},
		isSwappable: false,
		isBaseAsset: false,
		isAaveInterestToken: true,
		subAssets: [],
		decimals: 18,
		logoSrc: DAI_LOGO,
	},
	// [tokens.TST]: {
	// 	symbol: 'TST',
	// 	name: 'TST Goerli - main',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({ tokenAddress: tokens.TST, address })
	// 	},
	// 	isSwappable: false,
	// 	isBaseAsset: true,
	// 	subAssets: [],
	// 	decimals: 18,
	// 	logoSrc: DAI_LOGO,
	// },
	[tokens.LINK]: {
		symbol: 'LINK',
		name: 'ChainLink',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.LINK, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		subAssets: [tokens.aLINK],
		decimals: 18,
		logoSrc: LINK_LOGO,
	},
	[tokens.aLINK]: {
		symbol: 'aLINK',
		name: 'Aave interest bearing LINK',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.aLINK, address })
		},
		isSwappable: false,
		isBaseAsset: false,
		isAaveInterestToken: true,
		subAssets: [],
		decimals: 18,
		logoSrc: LINK_LOGO,
	},
}

export const mappers = {
	[ADXLoyaltyPoolToken.address]: mapADXLoyaltyPoolToken.bind(null),
	[StakingPool.address]: mapADXStakingPoolToken.bind(null),
	[tokens.aUSDT]: mapAAVEInterestToken.bind(null, assets[tokens.USDT].symbol),
	[tokens.aETH]: mapAAVEInterestToken.bind(null, assets[tokens.aETH].symbol),
	[tokens.aWETH]: mapAAVEInterestToken.bind(null, assets[tokens.WETH].symbol),
	[tokens.aDAI]: mapAAVEInterestToken.bind(null, assets[tokens.DAI].symbol),
	[tokens.WETH]: mapWrappedETH.bind(null, assets[tokens.ETH].symbol),
	[tokens.aLINK]: mapAAVEInterestToken.bind(null, assets[tokens.LINK].symbol),
}

export const assetsKovan = {
	tokens,
	assets,
	mappers,
	logos,
}
