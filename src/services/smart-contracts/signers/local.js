import { Signer, utils, Wallet } from 'ethers'
import { getLocalWallet } from 'services/wallet/wallet'
// import { SignatureModes } from 'constants/identity'

export default class LocalSigner extends Signer {
	constructor(provider, opts = {}) {
		super()

		this._provider = provider
		this._opts = opts
	}

	getWallet = async () => {
		if (this._wallet) {
			return this._wallet
		} else {
			const { email, password, authType } = this._opts
			const walletData = await getLocalWallet({
				email,
				password,
				authType,
			})

			this._wallet = new Wallet(walletData.data.privateKey, this._provider)
			return this._wallet
		}
	}

	get provider() {
		return this._provider
	}

	getAddress = async () => {
		return await this.getWallet().address
	}

	signTx = async params => {
		const signetTx = await this.getWallet().sign(params)
		return signetTx
	}

	sendTransaction = async params => {
		const txSigned = await this.signTx(params)
		const txData = this.provider.sendTransaction(txSigned)
		return txData
	}

	signMessage = async (message, opts = {}) => {
		if (opts.hex) {
			message = utils.arrayify(message)
		}

		const wallet = await this.getWallet()

		const signature = await wallet.signMessage(message)

		return signature
		// const res = {
		// 	signature,
		// 	hash: message,
		// 	mode: SignatureModes.GETH,
		// 	address: wallet.address,
		// }

		// return res
	}

	connect = provider => {
		return new LocalSigner(provider, {
			email: this.email,
			password: this.password,
		})
	}
}
