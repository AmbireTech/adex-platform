import { selectAccountStatsFormatted, selectAccountStats } from 'selectors'
import { createSelector } from 'reselect'
import { assets } from 'services/adex-wallet'

export const selectTradableAssetsFromSources = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData }) => {
		return Object.values(assetsData).map(x => ({
			value: x.address,
			label: `${x.symbol}`,
			imgSrc: (assets[x.address] || {}).logoSrc,
		}))
	}
)

export const selectTradableAssetsToSources = createSelector(
	[selectAccountStatsFormatted], // TODO: selected from
	({ assetsData }) => {
		return Object.entries(assets)
			.filter(x => x[1].isBaseAsset)
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
