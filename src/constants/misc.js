import { constants } from 'adex-models'

const { SignatureModes } = constants
export const AUTH_TYPES = {
	READONLY: { name: 'readonly' },
	METAMASK: { name: 'metamask', signType: SignatureModes.GETH, limit: 0 },
	TREZOR: { name: 'trezor', signType: SignatureModes.GETH, limit: 0 },
	DEMO: { name: 'demo', signType: SignatureModes.GETH, limit: 0 },
	GRANT: { name: 'grant', signType: SignatureModes.GETH, limit: 50 },
	QUICK: { name: 'quick', signType: SignatureModes.GETH, limit: 50 },
	SEED: { name: 'seed', signType: SignatureModes.GETH, limit: 500 },
}

export const NETWORK_STATUS = {
	0: 'pending',
	1: 'success',
	2: 'failed',
}

export const ETHEREUM_NETWORKS = {
	1: { name: 'Mainnet', for: 'production' },
	5: { name: 'Goerli', for: 'development' },
	42: { name: 'Kovan', for: 'development' },
	production: { name: 'Mainnet', for: 'production' },
	// development: { name: 'Goerli', for: 'development' },
	development: { name: 'Kovan', for: 'development' },
}

export const WHERE_YOU_KNOW_US = [
	{ label: 'LABEL_GOOGLE', value: 'search_engine' },
	{ label: 'LABEL_TWITTER', value: 'twitter' },
	{ label: 'LABEL_FACEBOOK', value: 'facebook' },
	{ label: 'LABEL_REDDIT', value: 'reddit' },
	{ label: 'LABEL_EVENT', value: 'event' },
	{ label: 'LABEL_FRIEND', value: 'friend' },
	{ label: 'LABEL_OTHER', value: 'other' },
]

export const WALLET_ACTIONS_MSGS = {
	[AUTH_TYPES.METAMASK.name]: [
		{ message: 'METAMASK_WAITING_ACTION' },
		{ message: 'METAMASK_WAITING_ACTION_INFO', strong: true },
	],
	[AUTH_TYPES.TREZOR.name]: [{ message: 'TREZOR_WAITING_ACTION' }],
	[AUTH_TYPES.QUICK.name]: [
		{ message: 'QUICK_WAITING_MSG' },
		{ message: 'QUICK_WAITING_MSG_INFO' },
	],
	[AUTH_TYPES.GRANT.name]: [
		{ message: 'GRANT_WAITING_MSG' },
		{ message: 'GRANT_WAITING_MSG_INFO' },
	],
	default: [{ message: 'WAITING_FOR_USER_ACTION' }],
}
