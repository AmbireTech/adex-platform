import { AdUnit, AdSlot, Campaign, Account } from 'adex-models'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes } = ItemsConstants

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
		authenticated: false
	},
	newItem: {
		[ItemsTypes.Campaign.id]: new Campaign().plainObj(),
		[ItemsTypes.AdUnit.id]: new AdUnit().plainObj(),
		[ItemsTypes.AdSlot.id]: new AdSlot().plainObj()
	},
	currentItem: {},
	items: {
		[ItemsTypes.Campaign.id]: {},
		[ItemsTypes.AdUnit.id]: {},
		[ItemsTypes.AdSlot.id]: {}
	},
	spinners: {},
	ui: {},
	toasts: [],
	confirm: {
		data: {}
	},
	nav: {
		side: ''
	},
	language: 'en-US',
	validations: {},
	newTransactions: {
		default: {}
	},
	web3Transactions: {},
	tags: {},
	identity: {
	},
	ethNetwork: {
		networkId: null,
		gasData: {}
	},
	wallet: {
	}
}

export default initialState
