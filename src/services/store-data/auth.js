// import configureStore from 'store/configureStore'
import actions from 'actions'
import configureStore from 'store/configureStore'
const { store } = configureStore

export const logOut = () => {
	actions.execute(actions.resetAccount())
	actions.execute(actions.resetAllItems())
	actions.execute(actions.resetAllBids())
}

export const isDemoMode = () => {
	return store.getState().persist.account._authType === 'demo'
}

export const getAccount = () => {
	return store.getState().persist.account
}