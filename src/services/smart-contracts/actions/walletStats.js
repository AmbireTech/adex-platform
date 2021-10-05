import { getEthersReadOnly } from 'services/smart-contracts/ethers'
import { BigNumber, utils } from 'ethers'
import { formatTokenAmount } from 'helpers/formatters'
import { privilegesNames } from './stats'
// import { getPrices } from 'services/prices'
import { getAssets, getMappers, getTokens } from 'services/adex-wallet'

const ZERO = BigNumber.from(0)

async function getAssetsData({ identityAddress }) {
	const assets = getAssets()
	const mappers = getMappers()
	const tokens = getTokens()
	const assetsBalances = (
		await Promise.all(
			Object.values(assets).map(
				async ({
					address,
					getBalance,
					symbol,
					decimals,
					name,
					isSwappable,
					isBaseAsset,
					isAaveInterestToken,
					...rest
				}) => {
					const balance = await getBalance({ address: identityAddress })
					const baseTokenBalance = mappers[address]
						? await mappers[address](balance)
						: [symbol, balance]

					return {
						address,
						symbol,
						balance,
						baseTokenBalance,
						decimals,
						name,
						isSwappable,
						isBaseAsset,
						isAaveInterestToken,
						...rest,
					}
				}
			)
		)
	).reduce((byAddress, data) => {
		byAddress[data.address] = data
		return byAddress
	}, {})

	const baseAssetsData = Object.entries(assets).reduce(
		(data, [address, asset]) => {
			const assetData = {
				...assetsBalances[address],
			}
			assetData.total = assetData.balance
			assetData.totalAvailable = assetData.balance

			if (asset.isBaseAsset) {
				const {
					total,
					specific,
					aaveWrapped,
					wrappedETH,
				} = asset.subAssets.reduce(
					(data, subAddr) => {
						const subData = assetsBalances[subAddr]
						data.total = data.total.add(
							(subData.baseTokenBalance || [])[1] || ZERO
						)
						data.specific = [...data.specific, subData]
						data.aaveWrapped = data.aaveWrapped.add(
							subData.isAaveInterestToken
								? (subData.baseTokenBalance || [])[1] || ZERO
								: ZERO
						)
						data.wrappedETH = data.wrappedETH.add(
							subData.isWrappedETH
								? (subData.baseTokenBalance || [])[1] || ZERO
								: ZERO
						)

						return data
					},
					{ total: ZERO, specific: [], aaveWrapped: ZERO, wrappedETH: ZERO }
				)

				assetData.total = assetData.total.add(total)
				assetData.aaveWrapped = aaveWrapped
				assetData.totalAvailable = assetData.totalAvailable
					.add(aaveWrapped)
					.add(wrappedETH)
				assetData.specific = specific.map(x => ({
					...x,
					...(x.address === tokens.WETH
						? { totalAvailableMainAsset: assetData.totalAvailable }
						: {}),
				}))
			}

			data[address] = assetData

			return data
		},
		{}
	)

	// WETH specific
	const totalAvailableBalanceETH = (baseAssetsData[tokens.ETH] || {})
		.totalAvailable

	baseAssetsData[tokens.WETH].totalAvailableMainAsset = totalAvailableBalanceETH
	baseAssetsData[tokens.WETH].kuraminko = 1234

	return baseAssetsData
}

const withPricesValue = ({ prices, value }) => {
	if (!prices) {
		return { USD: 0, EUR: 0 }
	}
	return Object.entries(prices).reduce((updated, [key, pr]) => {
		updated[key] = value * pr
		return updated
	}, {})
}

const sumPricesValues = currenciesValues => {
	return Object.keys(currenciesValues[0] || {}).reduce((sumByKey, key) => {
		sumByKey[key] = currenciesValues.reduce((sum, value) => {
			if (value[key]) {
				sum = sum + (value[key] || 0)
			}
			return sum
		}, 0)

		return sumByKey
	}, {})
}

export async function getAccountStatsWallet({ account, prices }) {
	const { wallet, identity } = account
	const { address } = identity
	const { getIdentityPayable } = await getEthersReadOnly()
	const { status = {} } = identity
	const identityContract = getIdentityPayable({
		address,
	})
	let privilegesAction

	const assets = getAssets()

	try {
		await identityContract.deployed()
		privilegesAction = identityContract.privileges(wallet.address)
	} catch (e) {
		console.error('getAccountStatsWallet', e)
		privilegesAction = Promise.resolve(status.type || 'Not Deployed')
	}

	const calls = [
		getAssetsData({ identityAddress: address, assets }),
		privilegesAction,
	]

	const [assetsData, walletPrivileges] = await Promise.all(
		calls.map(c =>
			c
				.then(res => res)
				.catch(e => {
					console.error(e)
					return undefined
				})
		)
	)

	console.log('assetsData', assetsData)

	const { withUsdValue, totalMainCurrenciesValues } = Object.entries(
		assetsData
	).reduce(
		(data, [key, asset]) => {
			data.withUsdValue[key] = { ...asset }
			if (asset.isBaseAsset) {
				const assetTotalValueFloat = utils.formatUnits(
					asset.total,
					asset.decimals
				)
				const assetTotalToMainCurrenciesValues = withPricesValue({
					prices: prices[asset.symbol],
					value: assetTotalValueFloat,
				})

				const assetBalanceValueFloat = utils.formatUnits(
					asset.balance,
					asset.decimals
				)

				const assetBalanceToMainCurrenciesValues = withPricesValue({
					prices: prices[asset.symbol],
					value: assetBalanceValueFloat,
				})

				data.withUsdValue[
					key
				].assetTotalToMainCurrenciesValues = assetTotalToMainCurrenciesValues

				data.withUsdValue[
					key
				].assetBalanceToMainCurrenciesValues = assetBalanceToMainCurrenciesValues

				data.totalMainCurrenciesValues = sumPricesValues([
					assetTotalToMainCurrenciesValues,
					data.totalMainCurrenciesValues,
				])
			}
			return data
		},
		{ withUsdValue: {}, totalMainCurrenciesValues: {} }
	)

	// console.log('assetsData', assetsData)

	// BigNumber values for balances
	const raw = {
		totalMainCurrenciesValues,
		assetsData: withUsdValue,
		walletPrivileges,
	}

	const formattedAssetsData = Object.entries(withUsdValue).reduce(
		(formatted, [key, value]) => {
			const formattedValue = { ...value }
			formattedValue.balance = formatTokenAmount(
				value.balance,
				assets[key].decimals
			)

			formattedValue.baseTokenBalance = [...value.baseTokenBalance]
			formattedValue.baseTokenBalance[1] = formatTokenAmount(
				value.baseTokenBalance[1],
				assets[key].decimals
			)

			formattedValue.total = formatTokenAmount(
				value.total,
				assets[key].decimals
			)

			formattedValue.aaveWrapped = formatTokenAmount(
				value.aaveWrapped,
				assets[key].decimals
			)
			formattedValue.wrappedETH = formatTokenAmount(
				value.wrappedETH,
				assets[key].decimals
			)

			formattedValue.totalAvailable = formatTokenAmount(
				value.totalAvailable,
				assets[key].decimals
			)

			formattedValue.specific = value.specific
				? [...value.specific].map(v => {
						const specificFormatted = { ...v }
						specificFormatted.balance = formatTokenAmount(
							v.balance,
							assets[v.address].decimals
						)

						specificFormatted.baseTokenBalance = [...v.baseTokenBalance]
						specificFormatted.baseTokenBalance[1] = formatTokenAmount(
							v.baseTokenBalance[1],
							assets[key].decimals
						)

						return specificFormatted
				  })
				: null

			formatted[key] = formattedValue
			return formatted
		},
		{}
	)

	const formatted = {
		totalMainCurrenciesValues, // TODO: format
		assetsData: formattedAssetsData,
		walletAddress: wallet.address,
		walletAuthType: wallet.authType,
		walletPrivileges: privilegesNames[walletPrivileges],
		identityAddress: identity.address,
	}

	return {
		raw,
		formatted,
	}
}
