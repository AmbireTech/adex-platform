import { createSelector } from 'reselect'
import { createDeepEqualSelector } from './selectors'

export const selectAccount = state => state.persist.account

export const selectAuth = createSelector(
	selectAccount,
	({ wallet, identity }) =>
		!!wallet &&
		!!wallet.address &&
		!!wallet.authSig &&
		!!wallet.authType &&
		!!identity.address
)

export const selectAuthSig = createSelector(
	selectAccount,
	({ wallet }) => wallet.authSig
)

export const selectWallet = createDeepEqualSelector(
	selectAccount,
	({ wallet }) => wallet
)

export const selectAccountIdentity = createSelector(
	selectAccount,
	({ identity }) => identity
)

export const selectAccountIdentityAddr = createSelector(
	selectAccountIdentity,
	({ address }) => address
)

export const selectAccountStats = createSelector(
	selectAccount,
	({ stats }) => stats || {}
)

export const selectAccountStatsRaw = createSelector(
	selectAccountStats,
	({ raw }) => raw || {}
)

export const selectAccountStatsFormatted = createSelector(
	selectAccountStats,
	({ formatted }) => formatted || {}
)
