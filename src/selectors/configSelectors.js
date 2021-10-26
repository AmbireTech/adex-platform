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
// network,
// feeTokenWhitelist:
// [
// 	{
// 		address,
// 		symbol,
// 		decimals,
// 		standard,
// 		min,
// 		minDeploy,
// 		minRecommended,
// 		executeBaseFee: {
// 			WITHDRAW: '4200000000000000000',
// 			PRIVILEGES_CHANGE: '1000000000000000000',
// 			ENS_CHANGE: '1000000000000000000',
// 			DEFAULT: '1000000000000000000',
// 		},
// 	},
// ],
// routineWithdrawTokens, // [{ address, symbol, decimals, standard, minWeekly, minFinal, minPlatform }],
// coreAddr,
// baseIdentityAddr,
// identityFactoryAddr,
// registryAddr,
// daiAddr,
// marketUrl,
// identityRecoveryAddr,
// weeklyFeeAmount,
// mainToken, // { address, symbol, decimals, standard },
// advertiserMinGrantAmount
// relayerAddr
// gasPriceCap
// gasPriceRatio

// walletCfg: {
// 	feeTokens: cfg.feeTokens,
// 	feeCollector: cfg.feeCollector,
// 	whitelistedFactories: cfg.whitelistedFactories,
// 	whitelistedBaseIdentities: cfg.whitelistedBaseIdentities,
// 	marginGas: cfg.marginGas,
// 	gasMultipliers: cfg.gasMultipliers,
// 	networks: cfg.networks,
// 	pricesUpdateIntervalSeconds: cfg.pricesUpdateIntervalSeconds

// }

export const selectFeeTokens = createSelector(
	[selectRelayerConfig],
	({ feeTokens }) => feeTokens
)

export const selectFeeTokenWhitelist = createSelector(
	[selectRelayerConfig],
	({ feeTokenWhitelist }) => {
		return feeTokenWhitelist.reduce((all, t) => {
			const tokens = { ...all }
			tokens[t.address] = t

			return tokens
		}, {})
	}
)

export const selectRoutineWithdrawTokens = createSelector(
	[selectRelayerConfig],
	({ routineWithdrawTokens }) => {
		return routineWithdrawTokens.reduce((all, t) => {
			const tokens = { ...all }
			tokens[t.address] = t

			return tokens
		}, {})
	}
)

export const selectRoutineWithdrawTokenByAddress = createCachedSelector(
	selectRelayerConfig,
	(_, address) => address,
	({ routineWithdrawTokens }, address) => {
		return routineWithdrawTokens.find(token => token.address === address)
	}
)((_state, address = '-') => address)

export const selectRoutineWithdrawTokensAddresses = createSelector(
	[selectRelayerConfig],
	({ routineWithdrawTokens }) => {
		return routineWithdrawTokens.map(t => t.address)
	}
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

export const selectGasPriceCap = createSelector(
	[selectRelayerConfig],
	({ gasPriceCap }) => gasPriceCap
)

export const selectSaiToken = createSelector(
	[selectRelayerConfig, selectRoutineWithdrawTokens],
	({ saiAddr }, routineWithdrawTokens) => routineWithdrawTokens[saiAddr]
)

export const selectMainFeeToken = createSelector(
	[selectRelayerConfig, selectFeeTokenWhitelist],
	({ mainToken }, feeTokenWhitelist) => {
		return feeTokenWhitelist[mainToken.address]
	}
)
