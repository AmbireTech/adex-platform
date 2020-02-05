import Loop from './loop'
import {
	execute,
	updateAccountAnalytics,
	updateAccountCampaignsAnalytics,
} from 'actions'

const LOOP_TIMEOUT = 120 * 1000

const analyticsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: () => execute(updateAccountAnalytics()),
	loopName: '_ANALYTICS',
})

const analyticsCampaignsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: () => execute(updateAccountCampaignsAnalytics()),
	loopName: '_ANALYTICS_CAMPAIGNS_ADVANCED',
})

export { analyticsLoop, analyticsCampaignsLoop }
