import { createSelector } from 'reselect'
export const selectRelayerConfig = state => state.persist.config.relayer

export const selectConfig = createSelector(
	[selectRelayerConfig],
	relayerConfig => {
		return {
			...relayerConfig,
		}
	}
)
