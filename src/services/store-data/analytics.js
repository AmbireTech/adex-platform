import Loop from './loop'
import {
	execute,
	updateAccountAnalytics,
	updateAccountCampaignsAnalytics,
} from 'actions'
import { getState } from 'store'
import { selectAuth } from 'selectors'

const LOOP_TIMEOUT = 60 * 1000

const analyticsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: async () =>
		selectAuth(getState()) && (await execute(updateAccountAnalytics())),
	loopName: '_ANALYTICS',
	stopOn: () => !selectAuth(getState()),
})

const analyticsLoopCustom = ({ timeout, syncAction, stopOn }) =>
	new Loop({
		timeout: timeout,
		syncAction: async () => syncAction(),
		loopName: '_ANALYTICS_CUSTOM',
		stopOn: () => !selectAuth(getState()) || stopOn,
	})

const analyticsCampaignsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: async () =>
		selectAuth(getState()) &&
		(await execute(updateAccountCampaignsAnalytics())),
	loopName: '_ANALYTICS_CAMPAIGNS_ADVANCED',
	stopOn: () => !selectAuth(getState()),
})

export { analyticsLoop, analyticsCampaignsLoop, analyticsLoopCustom }
