import configureStore from 'store/configureStore'
import actions from 'actions'
import { getNonce, DEFAULT_DATA } from 'services/eth/gas'

const { store } = configureStore

let nonceTimeout = null

const clearNonceTimeout = () => {
	if (nonceTimeout) {
		clearTimeout(nonceTimeout)
		nonceTimeout = null
	}
}

const syncNonce = () => {
	const persist = store.getState().persist
	const account = persist.account
	let settings = { ...account.settings }

	return getNonce()
		.then((gasData)=> {
            
			settings.gasData = gasData

			let action = actions.updateAccount({ newValues: { settings: settings } })
			action(store.dispatch)
		})
		.catch(()=> {
			settings.gasData = DEFAULT_DATA

			let action = actions.updateAccount({ newValues: { settings: settings } })
			action(store.dispatch)
		})
}

const checkNonce = () => {
	syncNonce()
		.then(() => {
			checkNonceLoop()
		})
		.catch(() => {
			checkNonceLoop()
		})
}

const checkNonceLoop = () => {
	clearNonceTimeout()

	nonceTimeout = setTimeout(checkNonce, 30 * 60 * 1000)
}

const start = () => {
	clearNonceTimeout()
	checkNonce()
}

const stop = () => {
	clearNonceTimeout()
}


export default {
	start,
	stop
}