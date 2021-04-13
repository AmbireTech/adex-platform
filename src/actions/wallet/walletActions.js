import { Contract, BigNumber } from 'ethers'
import { getEthers } from 'services/smart-contracts/ethers'
import { AUTH_TYPES } from 'constants/misc'
import { contracts } from 'src/services/smart-contracts/contractsCfg.js'
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

const assets = {
	[ADXToken.address]: {
		symbol: ADXToken.symbol,
		getBalance: async function({ provider, address }) {
			const adxToken = getAdxToken(provider || AUTH_TYPES.READONLY)
			const balance = await adxToken.balanceOf(address)
			return balance
		},
		isBaseToken: true,
		subAssets: [ADXLoyaltyPoolToken.address, StakingPool.address],
	},
	[ADXLoyaltyPoolToken.address]: {
		symbol: ADXLoyaltyPoolToken.symbol,
		getBalance: async function({ provider, address }) {
			const loyaltyToken = getADXLoyaltyPoolToken(
				provider || AUTH_TYPES.READONLY
			)
			const balance = await loyaltyToken.balanceOf(address)
			return balance
		},
		isBaseToken: false,
		subAssets: [],
	},
	[StakingPool.address]: {
		symbol: StakingPool.symbol,
		getBalance: async function({ provider, address }) {
			const stakingPool = getADXStakingPoolToken(
				provider || AUTH_TYPES.READONLY
			)
			const balance = await stakingPool.balanceOf(address)
			return balance
		},
		isBaseToken: false,
		subAssets: [],
	},
}

const mappers = {
	[ADXLoyaltyPoolToken.address]: async function(loyaltyTokenAmount) {
		const { provider } = await getEthers(AUTH_TYPES.READONLY)

		const adexLoyaltyPoolToken = getADXLoyaltyPoolToken(provider)

		const [shareValue] = await Promise.all([adexLoyaltyPoolToken.shareValue()])

		const adxAmount = BigNumber.from(loyaltyTokenAmount)
			.mul(shareValue)
			.div(ADXLoyaltyPoolToken.decimalsMultiplier)

		return [assets[ADXToken.address].symbol, adxAmount]
	},
	[StakingPool.address]: async function(stakingTokenAmount) {
		const { provider } = await getEthers(AUTH_TYPES.READONLY)

		const adexStakingPoolToken = getADXStakingPoolToken(provider)

		const [shareValue] = await Promise.all([adexStakingPoolToken.shareValue()])

		const adxAmount = BigNumber.from(stakingTokenAmount)
			.mul(shareValue)
			.div(StakingPool.decimalsMultiplier)

		return [assets[ADXToken.address].symbol, adxAmount]
	},
}
