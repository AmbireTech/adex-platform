import { getState } from 'store'
import { createSelector } from 'reselect'

// can be used outside  components
export const selectRelayerConfig = state => {
	return (state || getState()).persist.config.relayer
}

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

export const selectRoutineWithdrawTokenByAddress = createSelector(
	[selectRelayerConfig, (_, address) => address],
	({ routineWithdrawTokens }, address) => {
		return routineWithdrawTokens.find(token => token.address === address)
	}
)

export const selectRoutineWithdrawTokensAddresses = createSelector(
	[selectRelayerConfig],
	({ routineWithdrawTokens }) => {
		return routineWithdrawTokens.map(t => t.address)
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
