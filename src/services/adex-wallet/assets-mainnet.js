import { getEthers } from 'services/smart-contracts/ethers'
import { Contract, BigNumber } from 'ethers'
import { AUTH_TYPES } from 'constants/misc'
import { contracts } from 'services/smart-contracts/contractsCfg.js'
import ADX_LOGO from 'resources/token-logos/ADX.png'
// import WETH_LOGO from 'resources/token-logos/WETH.png'
// import WBTC_LOGO from 'resources/token-logos/WBTC.png'
import USDT_LOGO from 'resources/token-logos/USDT.png'
import USDC_LOGO from 'resources/token-logos/USDC.png'
import WBTC_LOGO from 'resources/token-logos/WBTC.png'
import ETH_LOGO from 'resources/token-logos/ETH.png'
import WETH_LOGO from 'resources/token-logos/WETH.png'
// import UNI_LOGO from 'resources/token-logos/UNI.png'
// import DAI_LOGO from 'resources/token-logos/DAI.svg'
// import LINK_LOGO from 'resources/token-logos/LINK.png'
// import BTC_LOGO from 'resources/token-logos/BTC.png'
const { ADXLoyaltyPoolToken, StakingPool, ADXToken, ERC20 } = contracts

// 0xe0fba4fc209b4948668006b2be61711b7f465bae // lending proxy
// lending - 0x2646FcF7F0AbB1ff279ED9845AdE04019C907EBE
// 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
// 0xE592427A0AEce92De3Edee1F18E0157C05861564

const tokens = {
	// USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
	USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
	WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
	WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
	// [ADXToken.symbol]: ADXToken.address,
	// [StakingPool.symbol]: StakingPool.address,
	// [ADXLoyaltyPoolToken.symbol]: ADXLoyaltyPoolToken.address,
}

const getERC20Token = (provider, address) => {
	const token = new Contract(address, ERC20.abi, provider)

	return token
}

// const getAdxToken = provider => {
// 	const adxToken = new Contract(ADXToken.address, ADXToken.abi, provider)

// 	return adxToken
// }

// const getADXLoyaltyPoolToken = provider => {
// 	const adxLoyalty = new Contract(
// 		ADXLoyaltyPoolToken.address,
// 		ADXLoyaltyPoolToken.abi,
// 		provider
// 	)

// 	return adxLoyalty
// }

// const getADXStakingPoolToken = provider => {
// 	const adxStakingPool = new Contract(
// 		StakingPool.address,
// 		StakingPool.abi,
// 		provider
// 	)

// 	return adxStakingPool
// }

const getERC20Balance = async ({ tokenAddress, address }) => {
	const { provider } = await getEthers(AUTH_TYPES.READONLY)
	const token = getERC20Token(provider, tokenAddress)
	const balance = await token.balanceOf(address)

	return balance
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
	[tokens.WETH]: {
		symbol: 'WETH',
		name: 'Wrapped Ethereum',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.WETH, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		// subAssets: [tokens.aWETH],
		subAssets: [],
		decimals: 18,
		logoSrc: WETH_LOGO,
	},
	// [tokens.aWETH]: {
	// 	symbol: 'aWETH',
	// 	name: 'Aave interest bearing WETH',
	// 	getBalance: async function({ address }) {
	// 		return await getERC20Balance({ tokenAddress: tokens.aWETH, address })
	// 	},
	// 	isSwappable: false,
	// 	isBaseAsset: false,
	// 	isAaveInterestToken: true,
	// 	subAssets: [],
	// 	decimals: 18,
	// 	logoSrc: ETH_LOGO,
	// },
}

async function mapAAVEInterestToken(baseTokenSymbol, aTokenAmount) {
	return [baseTokenSymbol, aTokenAmount]
}

export const mappers = {
	// [ADXLoyaltyPoolToken.address]: async function(loyaltyTokenAmount) {
	// 	const { provider } = await getEthers(AUTH_TYPES.READONLY)
	// 	const adexLoyaltyPoolToken = getADXLoyaltyPoolToken(provider)
	// 	const [shareValue] = await Promise.all([adexLoyaltyPoolToken.shareValue()])
	// 	const adxAmount = BigNumber.from(loyaltyTokenAmount)
	// 		.mul(shareValue)
	// 		.div(ADXLoyaltyPoolToken.decimalsMultiplier.toString())
	// 	return [assets[ADXToken.address].symbol, adxAmount]
	// },
	// [StakingPool.address]: async function(stakingTokenAmount) {
	// 	const { provider } = await getEthers(AUTH_TYPES.READONLY)
	// 	const adexStakingPoolToken = getADXStakingPoolToken(provider)
	// 	const [shareValue] = await Promise.all([adexStakingPoolToken.shareValue()])
	// 	const adxAmount = BigNumber.from(stakingTokenAmount)
	// 		.mul(shareValue)
	// 		.div(StakingPool.decimalsMultiplier.toString())
	// 	return [assets[ADXToken.address].symbol, adxAmount]
	// },
	// [tokens.aUSDT]: mapAAVEInterestToken.bind(null, assets[tokens.USDT].symbol),
	// [tokens.aWETH]: mapAAVEInterestToken.bind(null, assets[tokens.WETH].symbol),
	// [tokens.aDAI]: mapAAVEInterestToken.bind(null, assets[tokens.DAI].symbol),
	// [tokens.aLINK]: mapAAVEInterestToken.bind(null, assets[tokens.LINK].symbol),
}

export const assetsMainnet = {
	tokens,
	assets,
	mappers,
}
