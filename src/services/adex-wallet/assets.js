import { getEthers } from 'services/smart-contracts/ethers'
import { Contract, BigNumber } from 'ethers'
import { AUTH_TYPES } from 'constants/misc'
import { contracts } from 'services/smart-contracts/contractsCfg.js'
import ADX_LOGO from 'resources/token-logos/ADX.png'
// import WETH_LOGO from 'resources/token-logos/WETH.png'
// import WBTC_LOGO from 'resources/token-logos/WBTC.png'
import USDT_LOGO from 'resources/token-logos/USDT.png'
import ETH_LOGO from 'resources/token-logos/ETH.png'
// import BTC_LOGO from 'resources/token-logos/BTC.png'
const { ADXLoyaltyPoolToken, StakingPool, ADXToken, ERC20 } = contracts

const goerliTokens = {
	USDT: '0x509ee0d083ddf8ac028f2a56731412edd63223b9',
	WETH: '0x0bb7509324ce409f7bbc4b701f932eaca9736ab7',
}

const mainnetTokens = {
	USDT: '0xdac17f958d2ee523a2206206994597c13d831ec7',
	WETH: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
}

const tokens =
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
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: ADXToken.address, address })
		},
		isBaseAsset: true,
		subAssets: [ADXLoyaltyPoolToken.address, StakingPool.address],
		decimals: ADXToken.decimals,
		logoSrc: ADX_LOGO,
	},
	[ADXLoyaltyPoolToken.address]: {
		symbol: ADXLoyaltyPoolToken.symbol,
		getBalance: async function({ address }) {
			return await getERC20Balance({
				tokenAddress: ADXLoyaltyPoolToken.address,
				address,
			})
		},
		isBaseAsset: false,
		subAssets: [],
		decimals: ADXLoyaltyPoolToken.decimals,
		logoSrc: ADX_LOGO,
	},
	[StakingPool.address]: {
		symbol: StakingPool.symbol,
		getBalance: async function({ address }) {
			return await getERC20Balance({
				tokenAddress: StakingPool.address,
				address,
			})
		},
		isBaseAsset: false,
		subAssets: [],
		decimals: StakingPool.decimals,
		logoSrc: ADX_LOGO,
	},
	[tokens.USDT]: {
		symbol: 'USDT',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.USDT, address })
		},
		isBaseAsset: true,
		subAssets: [],
		decimals: 6,
		logoSrc: USDT_LOGO,
	},
	[tokens.WETH]: {
		symbol: 'WETH',
		getBalance: async function({ address }) {
			return await getERC20Balance({ tokenAddress: tokens.WETH, address })
		},
		isBaseAsset: true,
		subAssets: [],
		decimals: 18,
		logoSrc: ETH_LOGO,
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
