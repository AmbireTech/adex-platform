import { createSelector } from 'reselect'
import { createDeepEqualSelector } from 'selectors'
import { getState } from 'store'

export const selectAccount = state => state.persist.account
export const selectChannels = state => (state || getState()).persist.channels

export const selectAuth = createSelector(
	selectAccount,
	({ wallet, identity }) =>
		!!wallet &&
		!!wallet.address &&
		!!wallet.authSig &&
		!!wallet.authType &&
		!!identity.address
)

export const selectWallet = createDeepEqualSelector(
	selectAccount,
	({ wallet }) => wallet
)

export const selectAuthSig = createSelector(
	selectWallet,
	({ authSig }) => authSig
)

export const selectAuthType = createSelector(
	selectWallet,
	({ authType }) => authType
)

export const selectAccountIdentity = createDeepEqualSelector(
	selectAccount,
	({ identity }) => identity
)

export const selectAccountIdentityAddr = createSelector(
	selectAccountIdentity,
	({ address }) => address
)

export const selectAccountStats = createDeepEqualSelector(
	selectAccount,
	({ stats }) => stats || {}
)

export const selectAccountSettings = createDeepEqualSelector(
	selectAccount,
	({ settings }) => settings || {}
)

export const selectAccountStatsRaw = createSelector(
	selectAccountStats,
	({ raw }) => raw || {}
)

export const selectAccountStatsFormatted = createSelector(
	selectAccountStats,
	({ formatted }) => formatted || {}
)

export const selectAccountIdentityRoutineAuthTuple = createSelector(
	selectAccountIdentity,
	({ relayerData }) =>
		relayerData &&
		relayerData.routineAuthorizationsData &&
		relayerData.routineAuthorizationsData[0]
			? relayerData.routineAuthorizationsData[0]
			: null
)

export const selectChannelsWithUserBalances = createSelector(
	selectChannels,
	({ withBalance }) => withBalance
)
