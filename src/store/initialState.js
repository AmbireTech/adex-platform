import { AdUnit, AdSlot, Campaign, Account } from 'adex-models'
import {
	VALIDATOR_ANALYTICS_SIDES,
	VALIDATOR_ANALYTICS_EVENT_TYPES,
	VALIDATOR_ANALYTICS_METRICS,
	// VALIDATOR_ANALYTICS_TIMEFRAMES,
} from 'constants/misc'

export const getValidatorAnalyticsInitialState = () => {
	const initialState = {}
	const tf = 'day' // must be somewhere else
	VALIDATOR_ANALYTICS_SIDES.forEach(side =>
		VALIDATOR_ANALYTICS_EVENT_TYPES.forEach(eventType =>
			VALIDATOR_ANALYTICS_METRICS.forEach(
				metric => {
					initialState[side] = initialState[side] || {}
					initialState[side][eventType] = initialState[side][eventType] || {}
					initialState[side][eventType][metric] =
						initialState[side][eventType][metric] || {}
					initialState[side][eventType][metric][tf] =
						initialState[side][eventType][metric][tf] || {}
					initialState.tf = tf
				}
				// VALIDATOR_ANALYTICS_TIMEFRAMES.forEach(timeframe => {})
			)
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
