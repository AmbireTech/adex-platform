import Loop from './loop'
import {
	execute,
	updateAccountAnalytics,
	updateAccountAdvancedAnalytics,
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

const advancedAnalyticsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: async () =>
		selectAuth(getState()) && (await execute(updateAccountAdvancedAnalytics())),
	loopName: '_ANALYTICS_CAMPAIGNS_ADVANCED',
	stopOn: () => !selectAuth(getState()),
})

export { analyticsLoop, advancedAnalyticsLoop, analyticsLoopCustom }
