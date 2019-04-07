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
		Campaign: new Campaign().plainObj(),
		AdUnit: new AdUnit().plainObj(),
		AdSlot: new AdSlot().plainObj()
	},
	currentItem: {},
	items: {
		Campaign: {},
		AdUnit: {},
		AdSlot: {}
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
