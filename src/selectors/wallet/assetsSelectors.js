import { selectAccountStatsFormatted, selectAccountStats } from 'selectors'
import { createSelector } from 'reselect'
import { assets } from 'services/adex-wallet/assets'

export const selectTradableAssetsFromSources = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData }) => {
		return Object.values(assetsData).map(x => ({
			value: x.address,
			label: `${x.symbol}`,
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
			}))
	}
)

export const selectBaseAssetsPrices = createSelector(
	[selectAccountStats],
	({ prices = {} }) => prices
)
