import { Signer, utils } from 'ethers'
import TrezorConnect from 'trezor-connect'
import { constants } from 'adex-models'

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

	get path() { return this._path }
	get provider() { return this._provider }

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

	sign = async (transaction) => {
		const tx = await utils.resolveProperties(transaction)
		const unsignedTx = utils.serializeTransaction(tx)
			.substring(2)

		const signature = await TrezorConnect
			.ethereumSignTransaction({
				path: this.path,
				transaction: unsignedTx
			})

		return signature
	}

	signMessage = async (message, opts = {}) => {
		const { success, payload } = await TrezorConnect
			.ethereumSignMessage({
				path: this.path,
				message: message,
				hex: !!opts.hex
			})

		if (success) {
			const res = {
				/*
				* NOTE: SignatureTypes.GETH
				* Current TrezorConnect window does not
				* accept device with old firmware 
				*/
				signature: '0x' + payload.signature,
				hash: message,
				mode: constants.SignatureModes.GETH,
				address: payload.address
			}

			return res
		} else {
			return {
				error: payload.error
			}
		}
	}
}