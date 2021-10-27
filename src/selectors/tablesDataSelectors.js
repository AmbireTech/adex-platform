import { selectAccountStatsFormatted } from 'selectors'
import { createSelector } from 'reselect'
import {} from 'services/adex-wallet'

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
