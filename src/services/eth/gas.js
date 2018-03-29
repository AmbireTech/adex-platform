const URL = 'https://ethgasstation.info/json/ethgasAPI.json'

export const DEFAULT_DATA = {
    safeLow: { price: 3, wait: 90 },
    average: { price: 4, wait: 30 },
    fast: { price: 21, wait:  2 },
    fastest: { price: 30, wait: 1 },
}

export const getGasData = () => {
    return fetch(URL, {
        method: 'GET'
    })
        .then((res) => {
            if (res.status >= 200 && res.status < 400) {
                return res.json()
            } else {
                // TODO: Default values
                return res.text()
                    .then((err) => {
                        throw new Error(res.statusText + ' - ' + err)
                    })
            }
        })
        .then((data) => {
            // Gas Price in Gwei, wait in minutes
            let gasData = {
                safeLow: { price: (data.safeLow / 10).toFixed(0), wait: data.safeLowWait },
                average: { price: (data.average / 10).toFixed(0), wait: data.avgWait },
                fast: { price: (data.fast / 10).toFixed(0), wait: data.fastWait },
                fastest: { price: (data.fastest / 10).toFixed(0), wait: data.fastestWait },
            }

            return gasData
        })
}