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
	resetTableState,
} from 'actions'
import ReactGA from 'react-ga'
import { campaignsLoop } from 'services/store-data/campaigns'
import statsLoop from 'services/store-data/account'
import { advancedAnalyticsLoop } from 'services/store-data/analytics'

import { push } from 'connected-react-router'
const DIMENSIONS_NOT_SET_OR_LOADING = null
export const logOut = skipRedirect => {
	execute(updateMemoryUi('initialDataLoaded', false))
	ReactGA.set({
		dimension1: DIMENSIONS_NOT_SET_OR_LOADING,
		dimension2: DIMENSIONS_NOT_SET_OR_LOADING,
	}) //reset dimensions after logout
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
	execute(resetTableState())
}

export const isDemoMode = () => {
	return getState().persist.account._authType === 'demo'
}

export const getAccount = () => {
	return getState().persist.account
}
