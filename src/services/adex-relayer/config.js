import configureStore from 'store/configureStore'
const { store } = configureStore

export const relayerConfig = () => {
	const cfg = store.getState().persist.config.relayer

	return cfg
}
