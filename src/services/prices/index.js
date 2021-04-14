export const PRICES_API_URL = `https://api.coingecko.com/api/v3/simple/price?ids=ADEX&vs_currencies=usd`

export async function getPrices() {
	try {
		const res = await fetch(PRICES_API_URL)
		const data = await res.json()

		if (!data.adex) {
			throw new Error('errors.gettingPrices')
		} else {
			return {
				ADX: {
					USD: data.adex.usd,
				},
			}
		}
	} catch (err) {
		console.error(err)
		return null
	}
}
