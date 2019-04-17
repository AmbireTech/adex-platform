import { getEthers } from 'services/smart-contracts/ethers'
import { utils } from 'ethers'
import { AUTH_TYPES } from 'constants/misc'
import TrezorSigner from 'services/smart-contracts/signers/trezor'
import LedgerSigner from 'services/smart-contracts/signers/ledger'
import LocalSigner from 'services/smart-contracts/signers/local'
import MetaMaskSigner from 'services/smart-contracts/signers/metamask'
import { translate } from 'services/translations/translations'
import { execute } from 'actions/common'
import { addWeb3Transaction } from 'actions/transactionActions'
import { addToast } from 'actions/uiActions'
import { updateAccount } from 'actions/accountActions'

/** 
 * NOTE: DO NOT CALL WITH CONNECTED SIGNER
 * Will fill missing props gasLimit, nonce, chainId, etc..  * 
 * */
export async function prepareTx({ tx, provider, sender }) {
	const pTx = await utils.populateTransaction(
		tx,
		provider,
		sender
	)

	// TO work with all signers
	pTx.gasLimit = pTx.gasLimit.toHexString()
	pTx.gasPrice = pTx.gasPrice.toHexString()
	pTx.value = pTx.value || utils.hexlify(0)
	pTx.nonce = utils.hexlify(pTx.nonce)

	return pTx
}

export async function processTx({
	tx,
	txSuccessData,
	from,
	account
}) {
	const { hash, nonce } = await tx
	const txData = {
		hash,
		nonce,
		...txSuccessData,
		status: 'pending',
		sendingTime: Date.now()
	}

	execute(
		addWeb3Transaction({ tx: txData, addr: from })
	)
	execute(
		addToast({
			type: 'accept',
			action: 'X',
			label: translate(
				'TRANSACTION_SENT_MSG',
				{
					args: [hash]
				}),
			timeout: 50000
		})
	)

	const settings = { ...account.settings }
	settings.nonce = nonce + 1
	execute(
		updateAccount({
			newValues: { settings }
		})
	)
}

export async function getSigner({ wallet, provider }) {
	// TODO: Maybe get provider here?
	const { authType, path, email, password } = wallet

	if (authType === AUTH_TYPES.METAMASK.name) {
		const signer = new MetaMaskSigner(provider)
		return signer
	}
	if (authType === AUTH_TYPES.LEDGER.name) {

		const signer = new LedgerSigner(provider, { path })

		return signer
	}
	if (authType === AUTH_TYPES.TREZOR.name) {
		const signer = new TrezorSigner(provider, { path })
		return signer
	}
	if (authType === AUTH_TYPES.GRANT.name) {
		const signer = new LocalSigner(provider, { email, password })

		return signer
	}

	throw new Error(`Invalid wallet authType ${wallet.authType}`)
}

// NOTE: works with typed data in format {type: 'solidity data type', name: 'string (label)', value: 'preferable string'} 
export const getTypedDataHash = ({ typedData }) => {
	let values = typedData.map((entry) => {
		return entry.value // ? .toString().toLowerCase()
	})
	let valuesHash = utils.keccak256.apply(null, values)

	let schema = typedData.map((entry) => { return entry.type + ' ' + entry.name })
	let schemaHash = utils.keccak256.apply(null, schema)

	let hash = utils.keccak256(schemaHash, valuesHash)

	return hash
}

export async function getAuthSig({ wallet }) {
	const { provider } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })

	const authToken = (Math.floor(Math.random() * Number.MAX_SAFE_INTEGER))
		.toString()
	const typedData = [
		{ type: 'uint', name: 'Auth token', value: authToken }
	]

	const hash = getTypedDataHash({ typedData: typedData })

	const signature = await signer.signMessage(hash, { hex: true })

	return {
		...signature,
		authToken,
		hash
	}
}