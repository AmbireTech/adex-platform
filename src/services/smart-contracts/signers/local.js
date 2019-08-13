import { Signer, utils, Wallet } from 'ethers'
import { getLocalWallet } from 'services/wallet/wallet'
import { constants } from 'adex-models'

export default class LocalSigner extends Signer {
	constructor(provider, opts = {}) {
		super()

		const { email, password, authType } = opts
		this._provider = provider

		const walletData = getLocalWallet({
			email,
			password,
			authType
		})

		this._wallet = new Wallet(
			walletData.data.privateKey,
			provider
		)
	}

	get provider() { return this._provider }

	getAddress = async () => {
		return this._wallet.address
	}

	signTx = async (params) => {
		const signetTx = this._wallet.sign(params)
		return signetTx
	}

	sendTransaction = async (params) => {
		const txSigned = await this.signTx(params)
		const txData = this.provider
			.sendTransaction(txSigned)
		return txData
	}

	signMessage = async (message, opts = {}) => {
		if (opts.hex) {
			message = utils.arrayify(message)
		}

		const signature = await this._wallet
			.signMessage(message)
		const res = {
			signature,
			hash: message,
			mode: constants.SignatureModes.GETH,
			address: this._wallet.address
		}

		return res
	}

	connect = (provider) => {
		return new LocalSigner(
			provider,
			{
				email: this.email,
				password: this.password
			})
	}
}