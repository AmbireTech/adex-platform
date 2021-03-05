import { AdUnit, AdSlot, Campaign, Account, Audience } from 'adex-models'
import { PROJECTS } from 'constants/global'

let initialState = {
	project: PROJECTS.platform,
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
			audienceInput: { version: '1', inputs: { devices: { apply: 'allin' } } },
			temp: { useUtmTags: true, useUtmSrcWithPub: true },
		}).plainObj(),
		AdUnit: new AdUnit({ temp: { addUtmLink: true } }).plainObj(),
		AdSlot: new AdSlot({
			rulesInput: { version: '1', inputs: { autoSetMinCPM: false } },
		}).plainObj(),
		Audience: new Audience({
			inputs: { version: '1', devices: { apply: 'allin' } },
		}).plainObj(),
		Website: {},
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
	tablesState: {},
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
