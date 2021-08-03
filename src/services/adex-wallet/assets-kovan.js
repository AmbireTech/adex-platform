import { getEthers } from 'services/smart-contracts/ethers'
import { Contract, BigNumber } from 'ethers'
import { AUTH_TYPES } from 'constants/misc'
import { contracts } from 'services/smart-contracts/contractsCfg.js'
import ADX_LOGO from 'resources/token-logos/ADX.png'
// import WETH_LOGO from 'resources/token-logos/WETH.png'
// import WBTC_LOGO from 'resources/token-logos/WBTC.png'
import USDT_LOGO from 'resources/token-logos/USDT.png'
import ETH_LOGO from 'resources/token-logos/ETH.png'
import UNI_LOGO from 'resources/token-logos/UNI.png'
import DAI_LOGO from 'resources/token-logos/DAI.svg'
import LINK_LOGO from 'resources/token-logos/LINK.png'
import ADX_WALLET_LOGO from 'resources/wallet/logo.png'

// import BTC_LOGO from 'resources/token-logos/BTC.png'
const { ADXLoyaltyPoolToken, StakingPool, ADXToken, ERC20 } = contracts

// 0xe0fba4fc209b4948668006b2be61711b7f465bae // lending proxy
// lending - 0x2646FcF7F0AbB1ff279ED9845AdE04019C907EBE
// 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D
// 0xE592427A0AEce92De3Edee1F18E0157C05861564

const kovanTokens = {
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

const goerliTokens = {
	USDT: '0x9bc43d6dcecae49ab1939dcd733c37b476746ea0',
	WETH: '0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6',
	UNI: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
	ADX: ADXToken.address,
	DAI: '0x4bd7AB4aA37dd7450a4a75BD6e268f5c2417b855', //DAI
	TST: '0x7af963cF6D228E564e2A0aA0DdBF06210B38615D',
}

const mainnetTokens = {
	USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
	WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
	UNI: '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
	ADX: ADXToken.address,
	DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
}

export const tokens =
	process.env.NODE_ENV === 'production' ? mainnetTokens : kovanTokens

const getERC20Token = (provider, address) => {
	const token = new Contract(address, ERC20.abi, provider)

	return token
}

const getAdxToken = provider => {
	const adxToken = new Contract(ADXToken.address, ADXToken.abi, provider)

	return adxToken
}

const getADXLoyaltyPoolToken = provider => {
	const adxLoyalty = new Contract(
		ADXLoyaltyPoolToken.address,
		ADXLoyaltyPoolToken.abi,
		provider
	)

	return adxLoyalty
}

const getADXStakingPoolToken = provider => {
	const adxStakingPool = new Contract(
		StakingPool.address,
		StakingPool.abi,
		provider
	)

	return adxStakingPool
}

const getERC20Balance = async ({ tokenAddress, address }) => {
	const { provider } = await getEthers(AUTH_TYPES.READONLY)
	const token = getERC20Token(provider, tokenAddress)
	const balance = await token.balanceOf(address)

	return balance
}

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

export const getLogo = addressOrSymbol => {
	return (
		logos[addressOrSymbol] || logos[tokens[addressOrSymbol]] || ADX_WALLET_LOGO
	)
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

async function mapAAVEInterestToken(baseTokenSymbol, aTokenAmount) {
	return [baseTokenSymbol, aTokenAmount]
}

export const mappers = {
	[ADXLoyaltyPoolToken.address]: async function(loyaltyTokenAmount) {
		const { provider } = await getEthers(AUTH_TYPES.READONLY)

		const adexLoyaltyPoolToken = getADXLoyaltyPoolToken(provider)

		const [shareValue] = await Promise.all([adexLoyaltyPoolToken.shareValue()])

		const adxAmount = BigNumber.from(loyaltyTokenAmount)
			.mul(shareValue)
			.div(ADXLoyaltyPoolToken.decimalsMultiplier.toString())

		return [assets[ADXToken.address].symbol, adxAmount]
	},
	[StakingPool.address]: async function(stakingTokenAmount) {
		const { provider } = await getEthers(AUTH_TYPES.READONLY)

		const adexStakingPoolToken = getADXStakingPoolToken(provider)

		const [shareValue] = await Promise.all([adexStakingPoolToken.shareValue()])

		const adxAmount = BigNumber.from(stakingTokenAmount)
			.mul(shareValue)
			.div(StakingPool.decimalsMultiplier.toString())

		return [assets[ADXToken.address].symbol, adxAmount]
	},
	[tokens.aUSDT]: mapAAVEInterestToken.bind(null, assets[tokens.USDT].symbol),
	[tokens.aWETH]: mapAAVEInterestToken.bind(null, assets[tokens.WETH].symbol),
	[tokens.aDAI]: mapAAVEInterestToken.bind(null, assets[tokens.DAI].symbol),
	[tokens.aLINK]: mapAAVEInterestToken.bind(null, assets[tokens.LINK].symbol),
}

export const assetsKovan = {
	tokens,
	assets,
	mappers,
	getLogo,
}
