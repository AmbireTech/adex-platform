import { createSelector } from 'reselect'

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

export const selectWallet = createSelector(
	selectAccount,
	({ wallet }) => wallet
)
