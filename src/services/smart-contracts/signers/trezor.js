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

	signTx = async (params) => {
		const txProps = await utils.resolveProperties(params)

		txProps.value = txProps.value || utils.hexlify(0)

		const { success, payload } = await TrezorConnect
			.ethereumSignTransaction({
				path: this.path,
				transaction: txProps
			})

		if (success) {
			const signature = {
				r: payload.r,
				s: payload.s,
				v: parseInt(payload.v)
			}

			const txSigned = utils.serializeTransaction(
				txProps,
				signature
			)

			return txSigned
		} else {
			throw new Error(payload.error)
		}
	}

	sendTransaction = async (params) => {
		const txSigned = await this.signTx(params)
		const txData = this.provider.sendTransaction(txSigned)
		return txData
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

	connect = (provider) => {
		return new TrezorSigner(provider, { path: this.path })
	}
}