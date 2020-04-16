import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'
import { popupCenter } from 'helpers/popupHelper'
import url from 'url'
import { t } from 'selectors'

const PAYTRIE_PARTNER_URL = 'https://partner.paytrie.com/?app=876454'
//TODO: Change testwyre to production
const WYRE_URL = 'https://pay.testwyre.com/purchase?'

export const openWyre = ({ accountId, symbol, ...rest }) => {
	const URL = url.parse(WYRE_URL, true)
	URL.search = null
	if (accountId) {
		URL.query = {
			...URL.query,
			dest: accountId ? `ethereum:${accountId}` : null,
			referenceId: accountId,
			destCurrency: symbol,
			...rest,
		}
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

export const openPayTrie = ({ accountId, email, symbol, ...rest }) => {
	const URL = url.parse(PAYTRIE_PARTNER_URL, true)
	URL.search = null
	URL.query = {
		...URL.query,
		addr: accountId,
		email,
		rightSideLabel: symbol,
		...rest,
	}
	popupCenter({
		//TODO: Change testwyre to production
		url: url.format(URL),
		title: t('PAYTRIE_DEPOSIT'),
		w: 400,
		h: 700,
	})
}

export const openOnRampNetwork = ({ accountId, symbol }) => {
	const widget = new RampInstantSDK({
		hostAppName: 'AdExNetwork',
		hostLogoUrl: 'https://www.adex.network/img/Adex-logo@2x.png',
		variant: 'auto',
		swapAsset: symbol,
		userAddress: accountId,
	})
	widget.domNodes.overlay.style.zIndex = 1000
	widget.show()
}
