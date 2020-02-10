import Loop from './loop'
import { updateUserCampaigns, execute } from 'actions'
import { MOON_GRAVITY_ACCELERATION, MOON_TO_EARTH_WEIGHT } from 'constants/misc'

// 30 seconds = market statusLoopTick
const LOOP_TIMEOUT =
	2000 ||
	(69 - Math.floor(MOON_GRAVITY_ACCELERATION / MOON_TO_EARTH_WEIGHT)) * 500

let updates = 0
const syncCampaigns = () => {
	//TEMP
	const updateStats = updates % 3 === 0
	updates++
	execute(updateUserCampaigns(updateStats))
}

const campaignsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: () => syncCampaigns(),
	loopName: '_CAMPAIGNS',
})

export { campaignsLoop }
