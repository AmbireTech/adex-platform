import base64 from 'base64url'
import ethers from 'ethers'

// see https://github.com/ethereum/EIPs/issues/1341
// Implements EIP 1341: Ethereum Web Tokens

const HEADER = base64.encode(
	JSON.stringify({
		type: 'JWT',
		alg: 'ETH'
	})
)

// signer is always etherjs Wallet: https://docs.ethers.io/ethers.js/html/api-wallet.html
// .address is always checksummed
function sign(signer, payload) {
	const payloadEncoded = base64.encode(
		JSON.stringify({
			...payload,
			address: signer.address
		})
	)
	return signer.signMessage(`${HEADER}.${payloadEncoded}`).then(function(sig) {
		const sigBuf = Buffer.from(sig.signature.slice(2), 'hex')
		return `${HEADER}.${payloadEncoded}.${base64.encode(sigBuf)}`
	})
}

function verify(token) {
	const parts = token.split('.')
	if (parts.length !== 3) {
		return Promise.reject(new Error('verify: token needs to be of 3 parts'))
	}
	const msg = parts.slice(0, 2).join('.')
	const sigBuf = Buffer.from(parts[2], 'base64')
	try {
		const from = ethers.utils.verifyMessage(msg, sigBuf)
		const payload = JSON.parse(base64.decode(parts[1]))
		return Promise.resolve({ from, payload })
	} catch (e) {
		return Promise.reject(e)
	}
}

export default { sign, verify }