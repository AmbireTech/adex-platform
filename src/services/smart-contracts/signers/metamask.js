import { Signer, utils } from 'ethers'
// import { SignatureModes } from 'constants/identity'

export default class MetaMaskSigner extends Signer {
	constructor(provider, opts = {}) {
		super()
		this._provider = provider
		this._signer = provider.getSigner()
	}

	get provider() {
		return this._provider
	}

	getAddress = async () => {
		return this._signer.getAddress()
	}

	sendTransaction = async params => {
		return this._signer.sendTransaction(params)
	}

	signMessage = async (message, opts = {}) => {
		if (opts.hex) {
			message = utils.arrayify(message)
		}

		const signature = await this._signer.signMessage(message)

		return signature
		// // TODO: support EIP712
		// const res = {
		// 	signature,
		// 	hash: message,
		// 	mode: SignatureModes.GETH,
		// 	address: await this._signer.getAddress(),
		// }

		// return res
	}

	connect = provider => {
		return new MetaMaskSigner(provider)
	}
}
