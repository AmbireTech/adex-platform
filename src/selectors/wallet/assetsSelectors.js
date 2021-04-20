import { selectAccountStatsFormatted } from 'selectors'
import { createSelector } from 'reselect'
import { assets } from 'services/adex-wallet/assets'

export const selectTradableAssetsFromSources = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData }) => {
		return Object.values(assetsData).map(x => ({
			value: x.symbol,
			label: `${x.symbol} - ${x.balance}`,
		}))
	}
)

export const selectTradableAssetsToSources = createSelector(
	[selectAccountStatsFormatted], // TODO: selected from
	({ assetsData }) => {
		Object.entries(assets).map(([addr, x]) => ({
			value: x.symbol,
			label: `${x.symbol} - ${
				assetsData[addr] ? assetsData[addr].balance : ''
			}`,
		}))
	}
)
