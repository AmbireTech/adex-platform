const ETH_GAS_STATION = process.env.ETH_GAS_STATION

export const getGasStationStatus = async () => {
	const result = await fetch(`${ETH_GAS_STATION}json/ethgasAPI.json`, {
		method: 'GET',
	})

	if (result.status >= 200 && result.status < 400) {
		return await result.json()
	}

	return result
}
