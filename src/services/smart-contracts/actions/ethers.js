import { getEthers } from 'services/smart-contracts/ethers'
import { utils } from 'ethers'
import { AUTH_TYPES } from 'constants/misc'
import TrezorSigner from 'services/smart-contracts/signers/trezor'
import LedgerSigner from 'services/smart-contracts/signers/ledger'
import LocalSigner from 'services/smart-contracts/signers/local'
import MetaMaskSigner from 'services/smart-contracts/signers/metamask'
import { splitSig, Transaction } from 'adex-protocol-eth/js'

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
	if (
		authType === AUTH_TYPES.GRANT.name ||
		authType === AUTH_TYPES.QUICK.name
	) {
		const signer = new LocalSigner(provider, { email, password, authType })

		return signer
	}

	throw new Error(`Invalid wallet authType ${wallet.authType}`)
}

// NOTE: works with typed data in format {type: 'solidity data type', name: 'string (label)', value: 'preferable string'}
export const getTypedDataHash = ({ typedData }) => {
	const values = typedData.map(entry => {
		return typeof entry.value === 'string'
			? utils.toUtf8Bytes(entry.value)
			: utils.hexlify(entry.value)
	})
	const valuesHash = utils.keccak256.apply(null, values)
	const schema = typedData.map(entry => {
		return utils.toUtf8Bytes(entry.type + ' ' + entry.name)
	})

	const schemaHash = utils.keccak256.apply(null, schema)
	const hash = utils.solidityKeccak256(
		['bytes32', 'bytes32'],
		[schemaHash, valuesHash]
	)

	return hash
}

export async function getAuthSig({ wallet }) {
	const { provider } = await getEthers(wallet.authType)
	const signer = await getSigner({ wallet, provider })

	const authToken = Math.floor(
		Math.random() * Number.MAX_SAFE_INTEGER
	).toString()

	const typedData = [{ type: 'uint', name: 'Auth token', value: authToken }]
	const hash = getTypedDataHash({ typedData })
	const signature = await signer.signMessage(hash, { hex: true })

	return {
		...signature,
		authToken,
		hash,
	}
}

export async function getTransactionsReceipts({ txHashes = [], authType }) {
	const { provider } = await getEthers(authType)
	const receipts = txHashes.map(tx => provider.getTransactionReceipt(tx))

	return Promise.all(receipts)
}

export async function signTx({ tx, signer }) {
	const sig = await signer.signMessage(new Transaction(tx).hashHex(), {
		hex: true,
	})
	const signature = splitSig(sig.signature)
	return signature
}

export async function getMultipleTxSignatures({ txns, signer }) {
	const signatures = []
	for (const tx of txns) {
		signatures.push(await signTx({ tx, signer }))
	}

	return signatures
}
