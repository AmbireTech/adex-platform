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
// import BTC_LOGO from 'resources/token-logos/BTC.png'
const { ADXLoyaltyPoolToken, StakingPool, ADXToken, ERC20 } = contracts

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
	process.env.NODE_ENV === 'production' ? mainnetTokens : goerliTokens

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

export const assets = {
	[ADXToken.address]: {
		symbol: ADXToken.symbol,
		name: 'AdEx Network',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: ADXToken.address, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		subAssets: [ADXLoyaltyPoolToken.address, StakingPool.address],
		decimals: ADXToken.decimals,
		logoSrc: ADX_LOGO,
	},
	[ADXLoyaltyPoolToken.address]: {
		symbol: ADXLoyaltyPoolToken.symbol,
		name: 'AdEx Loyalty pool',
		getBalance: async function({ address }) {
			return await getERC20Balance({
				tokenAddress: ADXLoyaltyPoolToken.address,
				address,
			})
		},
		isSwappable: true,
		isBaseAsset: false,
		subAssets: [],
		decimals: ADXLoyaltyPoolToken.decimals,
		logoSrc: ADX_LOGO,
	},
	[StakingPool.address]: {
		symbol: StakingPool.symbol,
		name: 'AdEx Staking pool',
		getBalance: async function({ address }) {
			return await getERC20Balance({
				tokenAddress: StakingPool.address,
				address,
			})
		},
		isSwappable: true,
		isBaseAsset: false,
		subAssets: [],
		decimals: StakingPool.decimals,
		logoSrc: ADX_LOGO,
	},
	[tokens.USDT]: {
		symbol: 'USDT',
		name: 'Theter',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.USDT, address })
		},
		isSwappable: true,
		isBaseAsset: true,
		subAssets: [],
		decimals: 6,
		logoSrc: USDT_LOGO,
	},
	[tokens.WETH]: {
		symbol: 'WETH',
		name: 'WETH',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.WETH, address })
		},
		isSwappable: true,
		isBaseAsset: true,
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
		subAssets: [],
		decimals: 18,
		logoSrc: DAI_LOGO,
	},
	[tokens.TST]: {
		symbol: 'TST',
		name: 'TST Goerli - main',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.TST, address })
		},
		isSwappable: false,
		isBaseAsset: true,
		subAssets: [],
		decimals: 18,
		logoSrc: DAI_LOGO,
	},
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
}
