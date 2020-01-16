import Loop from './loop'
import { updateUserCampaigns, execute } from 'actions'
import { MOON_GRAVITY_ACCELERATION, MOON_TO_EARTH_WEIGHT } from 'constants/misc'

const LOOP_TIMEOUT =
	(69 - Math.floor(MOON_GRAVITY_ACCELERATION / MOON_TO_EARTH_WEIGHT)) * 500

const syncCampaigns = async () => {
	execute(updateUserCampaigns())
}

const campaignsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: syncCampaigns,
	loopName: '_CAMPAIGNS',
})

export default campaignsLoop
