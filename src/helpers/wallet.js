export const getMainCurrencyValue = ({
	asset,
	floatAmount,
	prices,
	mainCurrency = '',
}) => {
	const price = (prices[asset] || {})[mainCurrency.id || mainCurrency] || 0
	const value = parseFloat(floatAmount) * price
	return value.toFixed(4)
}
