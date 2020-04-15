import { popupCenter } from 'helpers/popupHelper'
import url from 'url'
import { t } from 'selectors'

const PAYTRIE_PARTNER_URL = 'https://partner.paytrie.com/?app=876454'
//TODO: Change testwyre to production
const WYRE_URL = 'https://pay.testwyre.com/purchase?'

export const openWyre = ({ dest, ...rest }) => {
	const URL = url.parse(WYRE_URL, true)
	URL.search = null
	if (dest) {
		dest = `ethereum:${dest}`
		const referenceId = dest
		URL.query = { ...URL.query, dest, referenceId, ...rest }
		popupCenter({
			url: url.format(URL),
			title: t('WYRE_DEPOSIT'),
			w: 400,
			h: 700,
		})
	} else {
		console.error('WYRE_DEPOSIT_MISSING_DEST_PARAM')
	}
}

export const openPayTrie = ({ addr, email, ...rest }) => {
	const URL = url.parse(PAYTRIE_PARTNER_URL, true)
	URL.search = null
	URL.query = { ...URL.query, addr, email, ...rest }
	popupCenter({
		//TODO: Change testwyre to production
		url: url.format(URL),
		title: t('PAYTRIE_DEPOSIT'),
		w: 400,
		h: 700,
	})
}
