import {
	getState,
	execute,
	resetAllNewItems,
	resetAllItems,
	resetAllBids,
	resetIdentity,
	resetAccount,
	resetAnalytics,
} from 'actions'

import { push } from 'connected-react-router'

export const logOut = () => {
	execute(push('/'))
	execute(resetIdentity())
	execute(resetAllItems())
	execute(resetAllNewItems())
	execute(resetAllBids())
	execute(resetAccount())
	execute(resetAnalytics())
}

export const isDemoMode = () => {
	return getState().persist.account._authType === 'demo'
}

export const getAccount = () => {
	return getState().persist.account
}
