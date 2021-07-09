import {
	selectAccountStatsFormatted,
	selectAccountStats,
	selectIdentitySideUi,
} from 'selectors'
import { createSelector } from 'reselect'
import { assets } from 'services/adex-wallet'
import { getPath, tokens } from 'services/adex-wallet'

export const selectTradableAssetsFromSources = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData = {} }) => {
		return Object.values(assetsData).map(x => ({
			value: x.address,
			label: `${x.symbol}`,
			imgSrc: (assets[x.address] || {}).logoSrc,
		}))
	}
)

export const selectDiversifiableAssetsFromSources = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData = {} }) => {
		return Object.values(assetsData)
			.filter(x => {
				if (!x.isSwappable || !x.isBaseAsset) {
					return false
				}
				if (x.address === tokens['WETH']) {
					return true
				}
				const { router, pools } = getPath({
					from: x.address,
					to: tokens['WETH'],
				})

				return router === 'uniV3' && pools && pools.length === 1
			})

			.map(x => ({
				value: x.address,
				label: `${x.symbol}`,
				imgSrc: (assets[x.address] || {}).logoSrc,
			}))
	}
)

export const selectTradableAssetsToSources = createSelector(
	[selectAccountStatsFormatted], // TODO: selected from
	({ assetsData } = {}) => {
		return Object.entries(assets)
			.filter(x => x[1].isBaseAsset && x[1].isSwappable)
			.map(([addr, x]) => ({
				value: addr,
				label: `${x.symbol}`,
				imgSrc: x.logoSrc,
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
