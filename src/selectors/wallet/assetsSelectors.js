import { selectAccountStatsFormatted, selectAccount } from 'selectors'
import { createSelector } from 'reselect'
import { assets } from 'services/adex-wallet/assets'

export const selectTradableAssetsFromSources = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData }) => {
		return Object.values(assetsData).map(x => ({
			value: x.address,
			label: `${x.symbol} - ${x.balance}`,
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
				label: `${x.symbol} - ${
					assetsData[addr] ? assetsData[addr].balance : ''
				}`,
			}))
	}
)

export const selectBaseAssetsPrices = createSelector(
	[selectAccount],
	({ prices }) => prices
)
