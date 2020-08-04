import {
	getState,
	execute,
	resetAllNewItems,
	resetAllItems,
	resetAllBids,
	resetIdentity,
	resetAccount,
	resetAnalytics,
	resetChannelsWithBalanceAll,
	resetChannelsWithOutstandingBalance,
	resetAllNewTransaction,
	updateMemoryUi,
} from 'actions'

import { campaignsLoop } from 'services/store-data/campaigns'
import statsLoop from 'services/store-data/account'
import { advancedAnalyticsLoop } from 'services/store-data/analytics'

import { push } from 'connected-react-router'

export const logOut = skipRedirect => {
	execute(updateMemoryUi('initialDataLoaded', false))
	execute(updateMemoryUi('gaDimensionsSet', false))
	execute(resetAccount())
	advancedAnalyticsLoop.stop()
	campaignsLoop.stop()
	statsLoop.stop()
	if (!skipRedirect) {
		execute(push('/'))
	}
	execute(resetIdentity())
	execute(resetAllItems())
	execute(resetAllNewItems())
	execute(resetAllBids())
	execute(resetAnalytics())
	execute(resetChannelsWithBalanceAll())
	execute(resetChannelsWithOutstandingBalance())
	execute(resetAllNewTransaction())
}

export const isDemoMode = () => {
	return getState().persist.account._authType === 'demo'
}

export const getAccount = () => {
	return getState().persist.account
}
