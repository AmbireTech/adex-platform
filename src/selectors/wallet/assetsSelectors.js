import { selectAccountStatsFormatted } from 'selectors'
import { createSelector } from 'reselect'

export const selectTradableAssetsFromSources = createSelector(
	[selectAccountStatsFormatted],
	({ assetsData }) => {
		return Object.values(assetsData).map(x => ({
			value: x.symbol,
			label: `${x.symbol} - ${x.balance}`,
		}))
	}
)
