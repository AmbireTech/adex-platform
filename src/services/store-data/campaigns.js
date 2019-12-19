import Loop from './loop'
import { getState, updateItems, execute, addToast } from 'actions'
import { getCampaigns } from 'services/adex-market/actions'
import { selectAccount, selectAuth } from 'selectors'
import { MOON_GRAVITY_ACCELERATION, MOON_TO_EARTH_WEIGHT } from 'constants/misc'

const LOOP_TIMEOUT =
	(69 - Math.floor(MOON_GRAVITY_ACCELERATION / MOON_TO_EARTH_WEIGHT)) * 500

const syncCampaigns = async () => {
	const hasAuth = selectAuth(getState())
	const { wallet, identity } = selectAccount(getState())
	const { authSig } = wallet
	const { address } = identity

	if (hasAuth && authSig && address) {
		try {
			const campaigns = await getCampaigns({ authSig, creator: address })

			const campaignsMapped = campaigns
				.filter(
					c => c.creator && c.creator.toLowerCase() === address.toLowerCase()
				)
				.map(c => {
					return { ...c.spec, ...c }
				})

			execute(updateItems({ items: campaignsMapped, itemType: 'Campaign' }))
		} catch (err) {
			console.error('ERR_GETTING_CAMPAIGNS', err)
			execute(
				addToast({
					type: 'cancel',
					toastStr: 'ERR_GETTING_ITEMS',
					args: [err],
				})
			)
		}
	}
}

const campaignsLoop = new Loop({
	timeout: LOOP_TIMEOUT,
	syncAction: syncCampaigns,
	loopName: '_CAMPAIGNS',
})

export default campaignsLoop
