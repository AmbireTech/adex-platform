import {
	selectAccountStatsFormatted,
	selectAccountStatsRaw,
	selectAccountStats,
	selectIdentitySideUi,
	selectFeeTokens,
} from 'selectors'
import { createSelector } from 'reselect'
import { getAssets, getPath, getTokens, getLogo } from 'services/adex-wallet'

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

		const diversifiable = Object.values(assetsData)
			.filter(x => {
				if (!x.isSwappable) {
					return false
				}

				// const isFromETHToken = isETHBasedToken({ address: x.address })
				const from = x.address //  isFromETHToken ? tokens['WETH'] : x.address
				// if (x.address === tokens['WETH']) {
				// 	return true
				// }

				try {
					const { router, pools } = getPath({
						from,
						to: tokens['WETH'],
					})

					return router === 'uniV3' && pools && pools.length === 1
				} catch (err) {
					console.log('err', err)
				}
			})
			.map(x => ({
				value: x.address,
				label: `${x.symbol}`,
				imgSrc: getLogo(x.address),
			}))
		return diversifiable
	}
)

export const selectFeeTokensWithRawBalance = createSelector(
	[selectAccountStatsRaw, selectFeeTokens],
	({ assetsData = {} }, feeTokens) => {
		console.log('asssetsData', assetsData)
		console.log('feeTokens', feeTokens)

		return (
			feeTokens
				// Only supported fee tokens with data
				.filter(({ address }) => assetsData[address])
				.map(({ address }) => assetsData[address])
		)
	}
)

export const selectFeeTokensWithBalanceSource = createSelector(
	[selectAccountStatsFormatted, selectFeeTokens],
	({ assetsData = {} }, feeTokens) => {
		console.log('asssetsData', assetsData)
		console.log('feeTokens', feeTokens)
		return Object.values(assetsData)
			.filter(x => {
				return feeTokens.some(y => {
					return x.address === y.address
				})
			})
			.map(x => ({
				value: x.address,
				label: `${x.symbol} ${x.balance}`,
				imgSrc: getLogo(x.address),
				disabled: x.isZeroBalance,
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
