import { getState } from 'store'
import { createSelector } from 'reselect'

// can be used outside  components
export const selectRelayerConfig = state => {
	return (state || getState()).persist.config.relayer
}

// - relayer cfg
// network,
// feeTokenWhitelist, // [{ address, symbol, decimals, standard, min, minDeploy }],
// routineWithdrawTokens, // [{ address, symbol, decimals, standard, minWeekly, minFinal }],
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

export const selectConfig = createSelector(
	[selectRelayerConfig],
	relayerConfig => {
		const cfg = { ...relayerConfig }
		return cfg
	}
)

export const selectMainToken = createSelector(
	[selectRelayerConfig],
	({ mainToken }) => mainToken
)

export const selectMainFeeToken = createSelector(
	[selectRelayerConfig, selectFeeTokenWhitelist],
	({ mainToken }, feeTokenWhitelist) => {
		return feeTokenWhitelist[mainToken.address]
	}
)
