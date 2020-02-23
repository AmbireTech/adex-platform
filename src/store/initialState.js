import { AdUnit, AdSlot, Campaign, Account } from 'adex-models'

let initialState = {
	account: new Account(),
	signin: {
		name: '',
		email: '',
		password: '',
		passConfirm: '',
		seed: '',
		publicKey: '',
		seedCheck: [],
		authenticated: false,
	},
	newItem: {
		Campaign: new Campaign().plainObj(),
		AdUnit: new AdUnit({ temp: { addUtmLink: true } }).plainObj(),
		AdSlot: new AdSlot().plainObj(),
	},
	currentItem: {},
	selectedItems: {
		campaings: [],
		adUnits: [],
		slots: [],
	},
	items: {
		Campaign: {},
		AdUnit: {},
		AdSlot: {},
	},
	spinners: {},
	ui: {
		global: {},
		byIdentity: {},
	},
	toasts: [],
	confirm: {
		data: {},
	},
	nav: {
		side: '',
	},
	language: 'en-US',
	validations: {},
	newTransactions: {
		default: {},
	},
	web3Transactions: {},
	tags: {},
	identity: {},
	ethNetwork: {
		networkId: null,
		gasData: {},
	},
	wallet: {},
	config: {
		relayer: {},
		market: {},
		validators: {},
	},
	analytics: { timeframe: 'day' },
	channels: {
		withBalanceAll: {},
		withOutstandingBalance: [],
	},
	ensAddresses: {},
}

export default initialState
