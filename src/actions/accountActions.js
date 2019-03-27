import * as types from 'constants/actionTypes'
import { addSig, getSig } from 'services/auth/auth'
import { getSession, checkSession } from 'services/adex-market/actions'
import scActions from 'services/smart-contracts/actions'
const { signAuthToken } = scActions

// MEMORY STORAGE
export function updateSignin(prop, value) {
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_SIGNIN,
			prop: prop,
			value: value
		})
	}
}

export function resetSignin() {
	return function (dispatch) {
		return dispatch({
			type: types.RESET_SIGNIN
		})
	}
}


// PERSISTENT STORAGE
export function createAccount(acc) {
	return function (dispatch) {
		return dispatch({
			type: types.CREATE_ACCOUNT,
			account: acc
		})
	}
}

// LOGOUT
export function resetAccount() {
	return function (dispatch) {
		return dispatch({
			type: types.RESET_ACCOUNT
		})
	}
}

export function updateAccount({ meta, ownProps }) {
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_ACCOUNT,
			meta: meta,
			ownProps: ownProps,
		})
	}
}

export function updateGasData({ gasData }) {
	return function (dispatch) {
		return dispatch({
			type: types.UPDATE_GAS_DATA,
			gasData: gasData
		})
	}
}

export function createSession({ wallet, identity, email }) {
	return async function (dispatch) {
		const newWallet = { ...wallet }
		const sessionSignature = getSig({ addr: newWallet.address, mode: newWallet.authType }) || null
		const hasSession = !!sessionSignature && (await checkSession({ authSig: sessionSignature, skipErrToast: true }))

		if (hasSession) {
			newWallet.authSig = sessionSignature
		} else {
			const { sig, sig_mode, authToken, hash, typedData } = await signAuthToken({
				userAddr: newWallet.address,
				authType: newWallet.authType,
				hdPath: newWallet.hdWalletAddrPath,
				addrIdx: newWallet.hdWalletAddrPath,
				privateKey: newWallet.privateKey
			})

			const { status, expiryTime } = await getSession({
				identity: identity.address,
				mode: sig_mode,
				signature: sig,
				authToken: authToken,
				hash,
				typedData,
				signerAddress: newWallet.address
			})

			if (status === 'OK') {
				addSig({ addr: wallet.address, sig, mode: wallet.authType, expiryTime: expiryTime })
				newWallet.authSig = sig
			}
		}

		return updateAccount({
			dispatch: dispatch,
			ownProps: {
				email: email,
				wallet: newWallet,
				identity: identity
			}
		})
	}

}