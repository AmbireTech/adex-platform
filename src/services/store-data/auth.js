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

import campaignsLoop from 'services/store-data/campaigns'

import { push } from 'connected-react-router'

export const logOut = skipRedirect => {
	if (!skipRedirect) {
		execute(push('/'))
	}
	campaignsLoop.stop()
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
