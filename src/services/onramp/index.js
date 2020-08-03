import { RampInstantSDK } from '@ramp-network/ramp-instant-sdk'
import { popupCenter } from 'helpers/popupHelper'
import transakSDK from '@transak/transak-sdk'
import url from 'url'
import { t } from 'selectors'

const PAYTRIE_PARTNER_URL = 'https://partner.paytrie.com/?app=876454'
const WYRE_URL = 'https://pay.sendwyre.com/purchase?'
const { RAMP_HOST_API_KEY, TRANSAK_API_KEY, TRANSAK_ENV } = process.env

//https://docs.sendwyre.com/docs/wyre-widget-v2
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
			w: 450,
			h: 700,
		})
	} else {
		console.error('WYRE_DEPOSIT_MISSING_DEST_PARAM')
	}
}

//https://paytrie.com/developer
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
		w: 450,
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
		hostApiKey: RAMP_HOST_API_KEY,
	})
	widget.domNodes.overlay.style.zIndex = 1300
	widget.show()
}

export const openTransak = ({ accountId, symbol }) => {
	const transak = new transakSDK({
		apiKey: TRANSAK_API_KEY, // Your API Key
		environment: TRANSAK_ENV, // STAGING/PRODUCTION
		cryptoCurrencyList: symbol,
		defaultCryptoCurrency: symbol,
		disableWalletAddressForm: true,
		walletAddress: accountId, // Your customer's wallet address
		themeColor: '000000', // App theme color
		// fiatCurrency: 'GBP', // INR/GBP
		email: '', // Your customer's email address
		redirectURL: '',
		hostURL: window.location.origin,
		widgetHeight: 'calc(100% - 60px)',
		widgetWidth: '100%',
	})

	transak.init()

	// To get all the events
	transak.on(transak.ALL_EVENTS, data => {
		console.log(data)
	})

	// This will trigger when the user marks payment is made.
	transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, orderData => {
		console.log(orderData)
		transak.close()
	})
}
