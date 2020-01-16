import configureStore from './configureStore'

export default configureStore

export const store = configureStore.store
export const persistor = configureStore.persistor
export const dispatch = store.dispatch
export const getState = store.getState
