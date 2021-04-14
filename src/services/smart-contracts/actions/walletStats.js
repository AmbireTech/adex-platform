import { getEthers } from 'services/smart-contracts/ethers'
import { Contract, BigNumber } from 'ethers'
import { formatTokenAmount } from 'helpers/formatters'
import { selectMainToken } from 'selectors'
import { AUTH_TYPES } from 'constants/misc'
import { privilegesNames, getWithdrawTokensBalances } from './stats'

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

const assets = {
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
	},
}

const mappers = {
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

const ZERO = BigNumber.from(0)

async function getAssetsData({ identityAddress, authType }) {
	const assetsBalances = (await Promise.all(
		Object.entries(assets).map(async ([address, { getBalance, symbol }]) => {
			const balance = await getBalance({ address: identityAddress })
			const baseTokenBalance = mappers[address]
				? await mappers[address](balance)
				: balance
			return {
				address,
				symbol,
				balance,
				baseTokenBalance,
			}
		})
	)).reduce((byAddress, data) => {
		byAddress[data.address] = data
		return byAddress
	}, {})

	const baseAssetsData = Object.entries(assets).reduce(
		(data, [address, asset]) => {
			if (asset.isBaseAsset) {
				const assetData = {
					...assetsBalances[address],
				}

				const { total, specific } = asset.subAssets.reduce(
					(data, subAddr) => {
						const subData = assetsBalances[subAddr]
						data.total = data.total.add(
							(subData.baseTokenBalance || [])[1] || ZERO
						)
						data.specific = [...data.specific, subData]

						return data
					},
					{ total: ZERO, specific: [] }
				)

				assetData.total = total
				assetData.specific = specific

				data[address] = assetData
			}

			return data
		},
		{}
	)

	return baseAssetsData
}

export async function getAccountStatsWallet({ account }) {
	const { wallet, identity } = account
	// const { authType } = wallet
	const { address } = identity
	const { getIdentity } = await getEthers(AUTH_TYPES.READONLY)
	const { decimals } = selectMainToken()

	const { status = {} } = identity
	const identityContract = getIdentity({ address })
	let privilegesAction
	try {
		await identityContract.deployed()
		privilegesAction = identityContract.privileges(wallet.address)
	} catch {
		privilegesAction = Promise.resolve(status.type || 'Not Deployed')
	}

	const calls = [
		getAssetsData({ identityAddress: address }),
		getWithdrawTokensBalances({ address }),
		privilegesAction,
	]

	const [
		assetsData,
		identityWithdrawTokensBalancesBalances = {},
		walletPrivileges,
	] = await Promise.all(
		calls.map(c =>
			c
				.then(res => res)
				.catch(e => {
					console.error(e)
					return undefined
				})
		)
	)

	// console.log('assetsData', assetsData)

	const identityBalanceMainToken =
		identityWithdrawTokensBalancesBalances.totalBalanceInMainToken ||
		BigNumber.from(0)

	// BigNumber values for balances
	const raw = {
		assetsData,
		identityWithdrawTokensBalancesBalances,
		walletPrivileges,
		identityBalanceMainToken,
	}

	const formatted = {
		assetsData,
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivileges: privilegesNames[walletPrivileges],
		identityAddress: identity.address,
		identityBalanceMainToken: formatTokenAmount(
			identityBalanceMainToken,
			decimals,
			false,
			2
		),
	}

	return {
		raw,
		formatted,
	}
}
