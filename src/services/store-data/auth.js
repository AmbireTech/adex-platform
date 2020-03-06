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
} from 'actions'

import { campaignsLoop } from 'services/store-data/campaigns'
import statsLoop from 'services/store-data/account'
import {
	analyticsLoop,
	analyticsCampaignsLoop,
} from 'services/store-data/analytics'

import { push } from 'connected-react-router'

export const logOut = skipRedirect => {
	execute(resetAccount())
	analyticsLoop.stop()
	analyticsCampaignsLoop.stop()
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
