import Loop from './loop'
import {
	execute,
	updateAccountAnalytics,
	updateAccountCampaignsAnalytics,
	updateSlotsDemand,
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

const slotsDemandLoop = new Loop({
	timeout: LOOP_TIMEOUT * 4,
	syncAction: () => execute(updateSlotsDemand()),
	loopName: '_SLOTS_DEMAND',
})

export { analyticsLoop, analyticsCampaignsLoop, slotsDemandLoop }
