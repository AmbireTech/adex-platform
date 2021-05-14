export const PRICES_API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=uniswap,adex,tether,weth&vs_currencies=usd,eur,dai`

const toStatsValue = data => {
	return Object.entries(data).reduce((value, [key, prices]) => {
		const mapped = { ...value }
		let statsKey = null
		switch (key) {
			case 'adex':
				statsKey = 'ADX'
				break
			case 'tether':
				statsKey = 'USDT'
				break
			case 'uniswap':
				statsKey = 'UNI'
				break
			default:
				statsKey = key.toUpperCase()
				break
		}

		const statsPrices = Object.entries(prices).reduce(
			(updated, [priceKey, priceVal]) => {
				updated[priceKey.toUpperCase()] = priceVal
				return updated
			},
			{}
		)

		mapped[statsKey] = statsPrices

		return mapped
	}, {})
}

export async function getPrices() {
	try {
		const res = await fetch(PRICES_API_URL)
		const data = await res.json()
		if (!data.adex) {
			throw new Error('errors.gettingPrices')
		} else {
			return toStatsValue(data)
		}
	} catch (err) {
		console.error(err)
		return null
	}
}
