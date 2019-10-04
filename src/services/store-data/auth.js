import {
	getState,
	execute,
	resetAllNewItems,
	resetAllItems,
	resetAllBids,
	resetIdentity,
	resetAccount,
} from 'actions'
export const logOut = () => {
	execute(resetAllItems())
	execute(resetAllNewItems())
	execute(resetAllBids())
	execute(resetIdentity())
	execute(resetAccount())
}

export const isDemoMode = () => {
	return getState().persist.account._authType === 'demo'
}

export const getAccount = () => {
	return getState().persist.account
}
