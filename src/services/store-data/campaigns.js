import Loop from './loop'
import { updateUserCampaigns, execute } from 'actions'
import { MOON_GRAVITY_ACCELERATION, MOON_TO_EARTH_WEIGHT } from 'constants/misc'

const LOOP_TIMEOUT =
	(69 - Math.floor(MOON_GRAVITY_ACCELERATION / MOON_TO_EARTH_WEIGHT)) * 500
// It might be 30 seconds or so

const syncCampaigns = async updateStats => {
	execute(updateUserCampaigns(updateStats))
}

const campaignsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: () => syncCampaigns(false),
	loopName: '_CAMPAIGNS',
})

const campaignsLoopStats = new Loop({
	timeout: LOOP_TIMEOUT * 2.5,
	syncAction: () => syncCampaigns(true),
	loopName: '_CAMPAIGNS_STATS',
})
export { campaignsLoop, campaignsLoopStats }
