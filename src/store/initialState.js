import { Bid, AdUnit, AdSlot, Campaign, Channel, Account } from 'adex-models'
import { items as ItemsConstants } from 'adex-constants'

const { ItemsTypes } = ItemsConstants

let initialState = {
	account: {
		account: new Account(),
	},
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
		[ItemsTypes.AdSlot.id]: new AdSlot().plainObj(),
		[ItemsTypes.Channel.id]: new Channel().plainObj(),
	},
	currentItem: {},
	items: {
		[ItemsTypes.Campaign.id]: {},
		[ItemsTypes.AdUnit.id]: {},
		[ItemsTypes.Channel.id]: {},
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
	bids: {
		bidsById: {},
		bidsIds: [null],
		bidsByAdslot: {},
		bidsByAdunit: {},
		auctionBids: {}, //temp
		advBids: [], // TODO: update on bid update
		pubBids: []
	},
	newBid: {
		empty: new Bid().plainObj()
	},
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
