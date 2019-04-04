import { Signer } from 'ethers'
import { ethers, utils } from 'ethers'
import LedgerEth from "@ledgerhq/hw-app-eth"
import TransportU2F from '@ledgerhq/hw-transport-u2f'
import HDKey from 'hdkey'
import { constants } from 'adex-models'

const DEFAULT_HD_PATH = "m/44'/60'/0'"

export default class LedgerSigner extends Signer {
	constructor(provider, opts = {}) {
		super()
		this._provider = provider
		this._path = opts.path || DEFAULT_HD_PATH
		this._transport = TransportU2F
	}

	get path() { return this._path }
	get provider() { return this._provider }

	addrsFromPubKey = async (
		publicKey = '',
		chainCode = '',
		{ from = 0, to = 19 } = {}) => {

		const hdKey = new HDKey()
		hdKey.publicKey = Buffer.from(publicKey, 'hex')
		hdKey.chainCode = Buffer.from(chainCode, 'hex')

		const addrs = []
		for (let index = from; index < to; index++) {
			const derivedKey = hdKey.derive(`m/${index}`)
				.publicExtendedKey

			const addr = utils.HDNode
				.fromExtendedKey(derivedKey)
				.address

			addrs.push({
				address: addr,
				path: `${this.path}/${index}`
			})
		}

		return addrs
	}

	getAddresses = async ({ from = 0, to = 5 } = {}) => {
		const transport = await this._transport.create()
		const eth = new LedgerEth(transport)
		const { publicKey, chainCode } = await eth
			.getAddress(this.path, false, true)

		const addresses = await this.addrsFromPubKey(
			publicKey,
			chainCode,
			{ from, to }
		)

		return addresses
	}

	signTx = async (tx) => {
		const txProps = await utils.resolveProperties(tx)
		const txUnsigned = utils.serializeTransaction(txProps)
			.substring(2)

		const transport = await this._transport.create()
		const eth = new LedgerEth(transport)
		const { r, s, v } = await eth.signTransaction(
			this.path,
			txUnsigned
		)

		const signature = {
			r: '0x' + r,
			s: '0x' + s,
			v
		}

		const txSigned = utils.serializeTransaction(
			txProps,
			signature
		)

		return txSigned
	}

	/*
	* TODO: may not work.
	* The ledger device or u2f seems to broken
	* Can list the addresses
	* Can sign messages
	* Signs transactions
	* Actually it show the tx but does not return value after 
	* confirmation on the device
	*/
	sendTransaction = async (tx) => {
		const txSigned = await this.signTx(tx)
		const txData = this.provider.sendTransaction(txSigned)
		return txData
	}

	signMessage = async (message, opts = {}) => {

		if (!opts.hex) {
			if (typeof (message) === 'string') {
				message = utils.toUtf8Bytes(message)
			}

			message = ethers.utils.hexlify(message)
		}

		message = message.substring(2)

		const transport = await this._transport.create()
		const eth = new LedgerEth(transport)

		const signature = await eth
			.signPersonalMessage(this.path, message)
		signature.r = '0x' + signature.r
		signature.s = '0x' + signature.s

		const { address } = await eth.getAddress(this.path)

		const res = {
			signature: ethers.utils.joinSignature(signature),
			hash: message,
			mode: constants.SignatureModes.GETH,
			address
		}

		return res
	}

	connect = (provider) => {
		return new LedgerSigner(provider, { path: this.path })
	}
}