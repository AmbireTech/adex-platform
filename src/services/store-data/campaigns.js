import Loop from './loop'
import { getState } from 'store'
import { selectAuth } from 'selectors'
import { updateUserCampaigns, execute } from 'actions'
import { MOON_GRAVITY_ACCELERATION, MOON_TO_EARTH_WEIGHT } from 'constants/misc'

// 30 seconds = market statusLoopTick
const LOOP_TIMEOUT =
	(69 - Math.floor(MOON_GRAVITY_ACCELERATION / MOON_TO_EARTH_WEIGHT)) * 500

const campaignsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: async () =>
		selectAuth(getState()) && (await execute(updateUserCampaigns())),
	loopName: '_CAMPAIGNS',
	stopOn: () => !selectAuth(getState()),
})

export { campaignsLoop }
