import { exchange as ExchangeConstants, items as ItemsConstants } from 'adex-constants'
const { BID_STATES, TIMEOUTS, SIGN_TYPES } = ExchangeConstants
const { AdTypes, AdSizes } = ItemsConstants

export const NO_IMAGE_URL = 'https://crestaproject.com/demo/nucleare-pro/wp-content/themes/nucleare-pro/images/no-image-box.png'
export const AVATAR_MAX_WIDTH = 600
export const AVATAR_MAX_HEIGHT = 400

export const SORT_PROPERTIES_BIDS = [
	{ value: '_state', label: '' },
	{ value: '_target', label: '' },
	{ value: '_amount', label: '' },
	{ value: '_timeout', label: '' }
]

export const FILTER_PROPERTIES_BIDS = {
	_state: { label: '_state', labelIsProp: true, values: Object.keys(BID_STATES).map((key) => { return { value: BID_STATES[key].id, label: BID_STATES[key].label } }) },
	_timeout: { label: '_timeout', labelIsProp: true, values: TIMEOUTS }
}

export const FILTER_PROPERTIES_BIDS_NO_STATE = {
	_timeout: FILTER_PROPERTIES_BIDS._timeout
}

export const SORT_PROPERTIES_ITEMS = [
	{ value: 'fullName' },
	{ value: 'createdOn' },
	{ value: 'size' },
	{ value: 'adType' },
]

export const SORT_PROPERTIES_COLLECTION = [
	{ value: 'fullName' },
	{ value: 'createdOn' }
]

export const FILTER_PROPERTIES_ITEMS = {
	'_meta.adType': { label: 'adType', labelIsProp: true, values: AdTypes },
	'_meta.size': { label: 'size', labelIsProp: true, values: AdSizes }
}

export const AUTH_TYPES = {
	METAMASK: { name: 'metamask', signType: SIGN_TYPES.Eip.id, limit: 0 },
	TREZOR: { name: 'trezor', signType: SIGN_TYPES.Trezor.id, limit: 0 },
	LEDGER: { name: 'ledger', signType: SIGN_TYPES.EthPersonal.id, limit: 0 },
	DEMO: { name: 'demo', signType: SIGN_TYPES.EthPersonal.id, limit: 0 },
	GRANT: { name: 'grant', signType: SIGN_TYPES.EthPersonal.id, limit: 50 },
	SEED: { name: 'seed', signType: SIGN_TYPES.EthPersonal.id, limit: 500 }
}

export const NETWORK_STATUS = {
	0: 'pending',
	1: 'success',
	2: 'failed'
}