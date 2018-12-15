import configureStore from 'store/configureStore'
import actions from 'actions'
import { getGasData, DEFAULT_DATA } from 'services/eth/gas'

const { store } = configureStore

let gasDataCheckTimeout = null

const clearGasDataTimeout = () => {
    if (gasDataCheckTimeout) {
        clearTimeout(gasDataCheckTimeout)
        gasDataCheckTimeout = null
    }
}

const syncGasData = () => {
    const persist = store.getState().persist
    const account = persist.account
    let settings = { ...account._settings }

    return getGasData()
        .then((gasData)=> {
            
            settings.gasData = gasData

            let action = actions.updateAccount({ ownProps: { settings: settings } })
            action(store.dispatch)
        })
        .catch(()=> {
            settings.gasData = DEFAULT_DATA

            let action = actions.updateAccount({ ownProps: { settings: settings } })
            action(store.dispatch)
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

    gasDataCheckTimeout = setTimeout(checkGasData, 30 * 60 * 1000)
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