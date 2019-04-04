import { Signer, providers, utils } from 'ethers'
import TrezorConnect from 'trezor-connect'

const DEFAULT_HD_PATH = "m/44'/60'/0'/0"

TrezorConnect.manifest({
	email: 'contactus@adex.network',
	appUrl: 'http://adex.network'
})

export default class TrezorSigner extends Signer {
	constructor(provider, opts = {}) {
		super()
		this._provider = provider
		this._path = opts.path || DEFAULT_HD_PATH

	}

	getAddsParams = ({ from = 0, to = 10 } = {}) => {
		const bundle = []
		for (let index = from; index < to; index++) {
			bundle.push({
				path: this.path + `/${index}`,
				showOnTrezor: false
			})
		}

		return { bundle }
	}

	getAddresses = async ({ from = 0, to = 9 } = {}) => {
		const { success, payload } = await TrezorConnect
			.ethereumGetAddress(this.getAddsParams({ from, to }))

		return { success, payload }
	}

	get path() { return this._path }
	get provider() { return this._provider }
}