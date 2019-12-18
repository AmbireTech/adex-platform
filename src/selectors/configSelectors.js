import { getState } from 'store'
import { createSelector } from 'reselect'

// can be used outside  components
export const selectRelayerConfig = state => {
	return (state || getState()).persist.config.relayer
}

// - relayer cfg
// network,
// feeTokenWhitelist, { address, symbol, decimals, min, minDeploy },
// routineWithdrawTokens, { address, symbol, decimals, minWeekly, minFinal },
// coreAddr,
// identityBaseAddr,
// identityFactoryAddr,
// registryAddr,
// daiAddr,
// marketUrl,
// identityRecoveryAddr,
// weeklyFeeAmount,
// mainTokenAddr,
// mainTokenSymbol,
// mainTokenDecimals,
// advertiserMinGrantAmount

export const selectConfig = createSelector(
	[selectRelayerConfig],
	relayerConfig => {
		const cfg = { ...relayerConfig }
		return cfg
	}
)
