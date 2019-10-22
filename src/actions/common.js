import configureStore from 'store/configureStore'
const { store } = configureStore

export const execute = store.dispatch

export const dispatch = store.dispatch

export const getState = () => {
	return store.getState()
}
