import { AdUnit, AdSlot, Campaign, Account } from 'adex-models'
import {
	VALIDATOR_ANALYTICS_SIDES,
	VALIDATOR_ANALYTICS_EVENT_TYPES,
	VALIDATOR_ANALYTICS_METRICS,
} from 'constants/misc'

export const getValidatorAnalyticsInitialState = () => {
	const initialState = { timeframe: 'day' }
	VALIDATOR_ANALYTICS_SIDES.forEach(side =>
		VALIDATOR_ANALYTICS_EVENT_TYPES.forEach(eventType =>
			VALIDATOR_ANALYTICS_METRICS.forEach(metric => {
				initialState[side] = initialState[side] || {}
				initialState[side][eventType] = initialState[side][eventType] || {}
				initialState[side][eventType][metric] =
					initialState[side][eventType][metric] || {}
				initialState[side][eventType][metric][initialState.timeframe] =
					initialState[side][eventType][metric][initialState.timeframe] || {}
			})
		)
	)

	return initialState
}

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
	items: {
		Campaign: {},
		AdUnit: {},
		AdSlot: {},
	},
	spinners: {},
	ui: {},
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
	analytics: getValidatorAnalyticsInitialState(),
}

export default initialState
