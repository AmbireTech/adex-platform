import { getState } from 'store'
import { createSelector } from 'reselect'
import { createCachedSelector } from 're-reselect'

// can be used outside  components
export const selectRelayerConfig = state => {
	const relayerConfig = (state || getState()).persist.config.relayer
	return relayerConfig
}

// can be used outside  components
export const selectNetwork = state => {
	const network = (state || getState()).persist.network
	return {
		...network,
	}
}

export const selectNetworkByChainId = createCachedSelector(
	selectRelayerConfig,
	(_state, chainId) => chainId,
	({ networks }, chainId) => {
		const id = (Object.entries(networks).find(
			([_key, x]) => x.chainId === chainId
		) || [])[0]

		return id
	}
)((_state, chainId) => chainId)

// - relayer cfg

// networks: cfg.networks,
// feeTokens: cfg.feeTokens,
// whitelistedFactories: cfg.whitelistedFactories,
// whitelistedBaseIdentities: cfg.whitelistedBaseIdentities,
// // @TODO
// // relayerAddr: wallet.address,
// protocolVersion: version,
// feeCollector: cfg.feeCollector

export const selectFeeTokens = createSelector(
	[selectRelayerConfig, selectNetwork],
	({ feeTokens }, { id }) => feeTokens.filter(x => x.network === id)
)

export const selectConfig = createSelector(
	[selectRelayerConfig],
	relayerConfig => relayerConfig
)

export const selectMainToken = createSelector(
	[selectRelayerConfig],
	({ mainToken }) => mainToken || {}
)

export const selectIdentityRecoveryAddr = createSelector(
	[selectRelayerConfig],
	({ identityRecoveryAddr }) => identityRecoveryAddr
)
