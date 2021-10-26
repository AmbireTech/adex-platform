import { Account } from 'adex-models'
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
	network: {},
	validations: {},
	newTransactions: {
		default: {},
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
	ensAddresses: {},
}

export default initialState
