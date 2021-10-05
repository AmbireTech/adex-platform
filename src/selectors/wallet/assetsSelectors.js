import {
	selectAccountStatsFormatted,
	selectAccountStats,
	selectIdentitySideUi,
} from 'selectors'
import { createSelector } from 'reselect'
import {
	getAssets,
	getPath,
	getTokens,
	getLogo,
	isETHBasedToken,
} from 'services/adex-wallet'

export const selectTradableAssetsFromSources = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData = {} }) => {
		return Object.values(assetsData)
			.filter(x => x.isSwappable)
			.map(x => ({
				value: x.address,
				label: `${x.symbol}`,
				imgSrc: getLogo(x.address),
			}))
	}
)

export const selectDiversifiableAssetsFromSources = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData = {} }) => {
		const tokens = getTokens()
		return Object.values(assetsData)
			.filter(x => {
				if (!x.isSwappable) {
					return false
				}

				const isFromETHToken = isETHBasedToken({ address: x.address })
				const from = isFromETHToken ? tokens['WETH'] : x.address
				// if (x.address === tokens['WETH']) {
				// 	return true
				// }
				const { router, pools } = getPath({
					from,
					to: tokens['WETH'],
				})

				return router === 'uniV3' && pools && pools.length === 1
			})

			.map(x => ({
				value: x.address,
				label: `${x.symbol}`,
				imgSrc: getLogo(x.address),
			}))
	}
)

export const selectWithdrawAssetsFromSources = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData = {} }) => {
		return Object.values(assetsData).map(x => ({
			value: x.address,
			label: `${x.symbol}`,
			imgSrc: getLogo(x.address),
		}))
	}
)

export const selectTradableAssetsToSources = createSelector(
	[selectAccountStatsFormatted], // TODO: selected from
	({ assetsData } = {}) => {
		const assets = getAssets()
		return Object.entries(assets)
			.filter(x => x[1].isBaseAsset && x[1].isSwappable)
			.map(([addr, x]) => ({
				value: addr,
				label: `${x.symbol}`,
				imgSrc: getLogo(x.symbol),
			}))
	}
)

export const selectBaseAssetsPrices = createSelector(
	[selectAccountStats],
	({ prices = {} }) => prices
)

export const selectMainCurrency = createSelector(
	[selectIdentitySideUi],
	({ mainCurrency = { id: 'USD', symbol: '$', symbolPosition: 'left' } }) =>
		mainCurrency
)

export const selectWalletAssetsTableData = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData = {} } = {}) => {
		return Object.values(assetsData)
			.filter(x => x.isBaseAsset)
			.map(({ symbol, name, balance, specific, address, ...rest }) => {
				return {
					// nameFilter: name,
					name: [name, symbol],
					symbol,
					balance: parseFloat(balance),
					balanceData: [
						parseFloat(balance),
						{
							symbol,
							name,
							balance,
							specific,
							address,
							...rest,
						},
					],
					actions: {
						actionsData: [{ address, symbol, name }].concat(
							!!specific && specific.length
								? specific
										.filter(x => x.balance > 0)
										.map(({ address: specificAddress, symbol, name }) => ({
											address: specificAddress,
											symbol,
											name,
										}))
								: []
						),
					},
				}
			})
	}
)
