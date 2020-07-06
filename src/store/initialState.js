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
		Campaign: new Campaign({
			audienceInput: { version: '1', inputs: {} },
			temp: { useUtmTags: true, useUtmSrcWithPub: true },
		}).plainObj(),
		AdUnit: new AdUnit({ temp: { addUtmLink: true } }).plainObj(),
		AdSlot: new AdSlot({
			rulesInput: { version: '1', inputs: { autoSetMinCPM: true } },
		}).plainObj(),
	},
	currentItem: {},
	selectedItems: {
		campaigns: [],
		adUnits: [],
		slots: [],
	},
	items: {
		Campaign: {},
		AdUnit: {},
		AdSlot: {},
		Website: {},
		Audience: {},
	},
	spinners: {},
	ui: {
		global: {},
		byIdentity: {},
	},
	uiMemory: {},
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
	targeting: {
		targetingData: [],
		minByCategory: {},
		countryTiersCoefficients: {},
	},
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
	analytics: {},
	channels: {
		withBalanceAll: {},
		withOutstandingBalance: [],
	},
	ensAddresses: {},
}

export default initialState
