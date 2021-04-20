import { getEthers } from 'services/smart-contracts/ethers'
import { Contract, BigNumber } from 'ethers'
import { AUTH_TYPES } from 'constants/misc'
import { contracts } from 'services/smart-contracts/contractsCfg.js'
const { ADXLoyaltyPoolToken, StakingPool, ADXToken } = contracts

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

// TODO: config or separate file
export const assets = {
	[ADXToken.address]: {
		symbol: ADXToken.symbol,
		getBalance: async function({ address }) {
			const { provider } = await getEthers(AUTH_TYPES.READONLY)
			const adxToken = getAdxToken(provider)
			const balance = await adxToken.balanceOf(address)
			return balance
		},
		isBaseAsset: true,
		subAssets: [ADXLoyaltyPoolToken.address, StakingPool.address],
		decimals: ADXToken.decimals,
	},
	[ADXLoyaltyPoolToken.address]: {
		symbol: ADXLoyaltyPoolToken.symbol,
		getBalance: async function({ address }) {
			const { provider } = await getEthers(AUTH_TYPES.READONLY)
			const loyaltyToken = getADXLoyaltyPoolToken(provider)
			const balance = await loyaltyToken.balanceOf(address)
			return balance
		},
		isBaseAsset: false,
		subAssets: [],
		decimals: ADXLoyaltyPoolToken.decimals,
	},
	[StakingPool.address]: {
		symbol: StakingPool.symbol,
		getBalance: async function({ address }) {
			const { provider } = await getEthers(AUTH_TYPES.READONLY)
			const stakingPool = getADXStakingPoolToken(provider)
			const balance = await stakingPool.balanceOf(address)
			return balance
		},
		isBaseAsset: false,
		subAssets: [],
		decimals: StakingPool.decimals,
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
