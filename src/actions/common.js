import configureStore from 'store/configureStore'
const { store } = configureStore

export function execute(action) {
	action(store.dispatch)
}
