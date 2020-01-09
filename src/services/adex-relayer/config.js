import { getState } from 'store'

export const relayerConfig = () => {
	const cfg = getState().persist.config.relayer

	return cfg
}
