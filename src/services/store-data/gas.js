import configureStore from 'store/configureStore'
import actions from 'actions'
import { getGasData, DEFAULT_DATA } from 'services/eth/gas'

const { store } = configureStore
const GAS_CHECK_INTERVAL = 30 * 60 * 1000

let gasDataCheckTimeout = null

const clearGasDataTimeout = () => {
    if (gasDataCheckTimeout) {
        clearTimeout(gasDataCheckTimeout)
        gasDataCheckTimeout = null
    }
}

const syncGasData = () => {
    const persist = store.getState().persist
    const currentGasData = persist.ethNetwork.gasData
    return getGasData()
        .then((gasData) => {

            // TODO: fix where it is used (web3 transactions)
            let action = actions.updateGasData({ gasData })
            action(store.dispatch)
        })
        .catch(() => {
            const setDefault = !currentGasData.safeLow // never set beforw

            if (setDefault) {
                let action = actions.updateGasData({ gasData: DEFAULT_DATA })
                action(store.dispatch)
            }
        })
}

const checkGasData = () => {
    syncGasData()
        .then(() => {
            checkGasDataLoop()
        })
        .catch(() => {
            checkGasDataLoop()
        })
}

const checkGasDataLoop = () => {
    clearGasDataTimeout()

    gasDataCheckTimeout = setTimeout(checkGasData, GAS_CHECK_INTERVAL)
}

const start = () => {
    clearGasDataTimeout()
    checkGasData()
}

const stop = () => {
    clearGasDataTimeout()
}


export default {
    start,
    stop
}