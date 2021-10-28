const initialState = {
	account: {
		email: '',
		identity: {
			address: '',
			status: 'pending',
			currentPrivileges: {},
			isLimitedVolume: true,
			relayerData: {},
			validatorAuthTokens: {},
		},
		wallet: {
			authSig: '', // Signature for adex-market session
			signType: '', // Sing type (Eip, Trezor, personal, etc..)
			authType: '', // Auth type (Metamask, Trezor, Ledger, Local)
			lsKey: '',
			path: '', // We are going to keep the entire path instead using path + index
			chainId: null, // need this for hd wallets
			balanceEth: '0',
			balanceDai: '0',
			// To unlock local wallet
			email: '',
			password: '',
		},
		temp: {},
		// TODO: think on this
		stats: {},
		settings: {},
	},
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
