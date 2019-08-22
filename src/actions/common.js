import configureStore from 'store/configureStore'
const { store } = configureStore

export const execute = action => {
	action(store.dispatch)
}
