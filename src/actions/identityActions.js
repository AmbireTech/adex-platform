import * as types from 'constants/actionTypes'
import {
	grantAccount,
	quickWalletSalt,
	getQuickWallet,
} from 'services/adex-relayer/actions'
import { updateSpinner, addToast } from './uiActions'
import { deployIdentityContract } from 'services/smart-contracts/actions/identity'
import {
	registerFullIdentity,
	registerExpectedIdentity,
	getOwnerIdentities,
} from 'services/adex-relayer/actions'
import { translate } from 'services/translations/translations'
import {
	createSession,
	registerAccount as registerAccountAction,
} from './accountActions'

import {
	getIdentityDeployData,
	withdrawFromIdentity,
	setIdentityPrivilege,
} from 'services/smart-contracts/actions/identity'
import {
	addDataToWallet,
	getWalletHash,
	getLocalWallet,
	migrateLegacyWallet,
	walletInfo,
} from 'services/wallet/wallet'
import { saveToLocalStorage } from 'helpers/localStorageHelpers'
import { selectAccount, selectIdentity } from 'selectors'
import { AUTH_TYPES } from 'constants/misc'
import { validEmail } from 'helpers/validators'
import { validate } from './validationActions'

// MEMORY STORAGE
export function updateIdentity(prop, value) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_IDENTITY,
			prop: prop,
			value: value,
		})
	}
}

export function resetIdentity() {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_IDENTITY,
		})
	}
}

export function initIdentity({ email, authType }) {
	return function(dispatch) {
		dispatch({
			type: types.RESET_IDENTITY,
		})

		dispatch({
			type: types.UPDATE_IDENTITY,
			prop: 'email',
			value: email,
		})

		return dispatch({
			type: types.UPDATE_IDENTITY,
			prop: 'authType',
			value: authType,
		})
	}
}

// MEMORY STORAGE
export function updateWallet(prop, value) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_WALLET,
			prop: prop,
			value: value,
		})
	}
}

export function resetWallet() {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_WALLET,
		})
	}
}

export function getGrantAccount({
	walletAddr,
	email,
	password,
	coupon,
	authType,
}) {
	return async function(dispatch) {
		updateSpinner('getting-grant-identity', true)(dispatch)
		try {
			const identityData = await grantAccount({
				ownerAddr: walletAddr,
				mail: email,
				couponCode: coupon,
			})

			// TODO: validate identityData

			if (identityData) {
				addDataToWallet({
					email,
					password,
					authType,
					dataKey: 'identity',
					dataValue: identityData.address,
				})
				addDataToWallet({
					email,
					password,
					authType,
					dataKey: 'privileges',
					dataValue: identityData.privileges,
				})
				updateIdentity('identityAddr', identityData.address)(dispatch)
				updateIdentity('identityData', identityData)(dispatch)
			}
		} catch (err) {
			console.error('ERR_REGISTER_GRANT_IDENTITY', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_REGISTER_GRANT_IDENTITY', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}

		updateSpinner('getting-grant-identity', false)(dispatch)
	}
}

export function deployFullIdentity({
	wallet,
	email,
	identityTxData,
	identityAddr,
}) {
	return async function(dispatch) {
		updateSpinner('getting-full-identity', true)(dispatch)
		try {
			const tx = await deployIdentityContract({
				...identityTxData,
				wallet,
			})

			const regInfo = await registerFullIdentity({
				txHash: tx.hash,
				identity: identityAddr,
				privileges: [wallet.address, 3],
				mail: email,
			})

			if (regInfo) {
				updateIdentity('isRegistered', true)(dispatch)
			} else {
				addToast({
					type: 'cancel',
					label: translate('ERR_REGISTER_IDENTITY', { args: [tx.hash] }),
					timeout: 20000,
				})(dispatch)
			}
		} catch (err) {
			console.error('ERR_REGISTER_IDENTITY', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_REGISTER_IDENTITY', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner('getting-full-identity', false)(dispatch)
	}
}

export function getIdentityTxData({ owner, privLevel }) {
	return async function(dispatch) {
		try {
			const txData = await getIdentityDeployData({ owner, privLevel })
			updateIdentity('identityAddr', txData.identityAddr)(dispatch)
			updateIdentity('identityTxData', txData)(dispatch)
		} catch (err) {
			console.error('ERR_GET_IDENTITY_TX_DATA', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_GET_IDENTITY_TX_DATA', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function getRegisterExpectedIdentity({ owner, mail }) {
	return async function(dispatch) {
		updateSpinner('getting-expected-identity', true)(dispatch)
		try {
			const identityData = await registerExpectedIdentity({ owner, mail })
			updateIdentity('identityData', identityData)(dispatch)
		} catch (err) {
			console.error('ERR_REGISTERING_EXPECTED_IDENTITY', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_REGISTERING_EXPECTED_IDENTITY', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner('getting-expected-identity', false)(dispatch)
	}
}

export function onUploadLocalWallet(event) {
	return async function(dispatch) {
		updateSpinner('uploading-account-data', true)(dispatch)
		const file = event.target.files[0]
		const reader = new FileReader()

		reader.onload = ev => {
			try {
				const obj = JSON.parse(ev.target.result)
				if (
					!obj ||
					!obj.key ||
					!obj.wallet ||
					!obj.wallet.data ||
					!obj.wallet.identity ||
					!obj.wallet.privileges
				) {
					throw new Error(translate('INVALID_JSON_DATA'))
				} else {
					saveToLocalStorage(obj.wallet, obj.key)
					updateIdentity('uploadedLocalWallet', obj.key)(dispatch)
					addToast({
						type: 'accept',
						label: translate('SUCCESS_UPLOADING_ACCOUNT_DATA'),
						timeout: 5000,
					})(dispatch)
				}
			} catch (err) {
				console.error('Error uploading account json data: ', err)
				addToast({
					type: 'cancel',
					label: translate('ERR_UPLOADING_ACCOUNT_DATA', {
						args: [err.message],
					}),
					timeout: 5000,
				})(dispatch)
			}
			updateSpinner('uploading-account-data', true)(dispatch)
		}

		const onError = err => {
			console.error('Error uploading account data.', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_UPLOADING_ACCOUNT_DATA', { args: [err] }),
				timeout: 5000,
			})(dispatch)
			updateSpinner('uploading-account-data', true)(dispatch)
		}

		reader.onerror = ev => {
			reader.abort()
			onError(translate())
		}

		reader.onabort = ev => {
			onError(translate('ABORTING_DATA_UPLOAD'))
		}

		reader.readAsText(file)
	}
}

export function identityWithdraw({
	amountToWithdraw,
	withdrawTo,
	tokenAddress,
}) {
	return async function(dispatch, getState) {
		try {
			const account = selectAccount(getState())
			const result = await withdrawFromIdentity({
				account,
				amountToWithdraw,
				withdrawTo,
				tokenAddress,
			})

			addToast({
				type: 'accept',
				label: translate('IDENTITY_WITHDRAW_NOTIFICATION', { args: [result] }),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_IDENTITY_WITHDRAW_NOTIFICATION', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_IDENTITY_WITHDRAW_NOTIFICATION', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function ownerIdentities({ owner }) {
	return async function(dispatch) {
		updateSpinner('getting-owner-identities', true)(dispatch)
		try {
			const identityData = await getOwnerIdentities({ owner })
			updateIdentity('ownerIdentities', identityData)(dispatch)
		} catch (err) {
			console.error('ERR_GETTING_OWNER_IDENTITIES', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_GETTING_OWNER_IDENTITIES', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner('getting-owner-identities', false)(dispatch)
	}
}

export function addrIdentityPrivilege({ setAddr, privLevel }) {
	return async function(dispatch, getState) {
		try {
			const account = selectAccount(getState())
			const result = await setIdentityPrivilege({
				account,
				setAddr,
				privLevel,
			})
			addToast({
				type: 'accept',
				label: translate('IDENTITY_SET_ADDR_PRIV_NOTIFICATION', {
					args: [result],
				}),
				timeout: 20000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_IDENTITY_SET_ADDR_PRIV_NOTIFICATION', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_IDENTITY_SET_ADDR_PRIV_NOTIFICATION', {
					args: [err],
				}),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function getQuickWalletSalt({ email }) {
	return async function(dispatch, getState) {
		updateSpinner('getting-quick-wallet-salt', true)(dispatch)
		let salt = null
		try {
			salt = (await quickWalletSalt({ email })).salt
		} catch (err) {
			console.error('ERR_GETTING_WALLET_SALT', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_GETTING_WALLET_SALT', {
					args: [err],
				}),
				timeout: 20000,
			})(dispatch)
		}
		updateIdentity('backupSalt', salt)(dispatch)
		updateSpinner('getting-quick-wallet-salt', false)(dispatch)
		return salt
	}
}

export function login() {
	return async function(dispatch, getState) {
		try {
			const identity = selectIdentity(getState())
			const {
				wallet,
				email,
				identityData,
				identityTxData,
				deleteLegacyKey,
				registerAccount,
			} = identity

			const newWallet = { ...wallet }

			if (registerAccount) {
				await registerAccountAction({
					owner: newWallet.address,
					identityTxData,
					email,
				})(dispatch)
			}

			await createSession({
				identity: identityData,
				wallet: newWallet,
				email,
				registerExpected: !identityData,
				deleteLegacyKey,
			})(dispatch)
		} catch (err) {
			addToast({
				type: 'cancel',
				label: translate('ERR_LOGIN', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function validateQuickLogin({ validateId, dirty }) {
	return async function(dispatch, getState) {
		updateSpinner(validateId, true)(dispatch)
		const identity = selectIdentity(getState())
		const { password, email, authType, backupSalt } = identity

		let wallet = {}
		let error = null
		let actualAuthType = authType

		try {
			if (email && password) {
				if (backupSalt) {
					const hash = getWalletHash({ salt: backupSalt, password })
					const { encryptedWallet } =
						(await getQuickWallet({
							hash,
						})) || {}

					const resetWallet = encryptedWallet || {}

					if (
						resetWallet.wallet &&
						resetWallet.key &&
						resetWallet.wallet.data &&
						resetWallet.wallet.identity &&
						resetWallet.wallet.privileges
					) {
						const info = walletInfo(resetWallet.key, 'backup', null)
						actualAuthType = info.authType
						saveToLocalStorage(resetWallet.wallet, resetWallet.key)
					}
				}

				const walletData =
					getLocalWallet({
						email,
						password,
						authType: actualAuthType,
					}) || {}

				if (!!walletData && walletData.data && walletData.data.address) {
					wallet = { ...walletData.data }
					wallet.email = email
					wallet.password = password
					wallet.authType = actualAuthType || AUTH_TYPES.GRANT.name
					wallet.identity = {
						address: walletData.identity,
						privileges: walletData.privileges || walletData.identityPrivileges,
					}

					if (!authType) {
						migrateLegacyWallet({ email, password })
						updateIdentity('deleteLegacyKey', true)(dispatch)
					}
				}

				updateIdentity('identityAddr', walletData.identity)(dispatch)
				updateIdentity('wallet', wallet)(dispatch)
				updateIdentity('walletAddr', wallet.address)(dispatch)
				updateIdentity('identityData', wallet.identity)(dispatch)
			}
		} catch (err) {
			console.error(err)
			error =
				(err && err.message ? err.message : err) || 'INVALID_EMAIL_OR_PASSWORD'
		}

		const isValid = !!wallet.address

		validate(validateId, 'wallet', {
			isValid,
			err: { msg: 'ERR_QUICK_WALLET_LOGIN', args: [error] },
			dirty: dirty,
		})(dispatch)

		if (isValid) {
			await login()(dispatch, getState)
		}
		updateSpinner(validateId, false)(dispatch)
	}
}

export function validateQuickRecovery({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		updateSpinner(validateId, true)(dispatch)
		try {
			const identity = selectIdentity(getState())
			const { email } = identity

			let isValid = validEmail(email)
			let msg = 'ERR_EMAIL'

			if (isValid) {
				isValid = !!(await getQuickWalletSalt({ email })(dispatch))
				msg = 'ERR_EMAIL_BACKUP_NOT_FOUND'
			}

			validate(validateId, 'email', {
				isValid,
				err: { msg },
				dirty: dirty,
			})(dispatch)

			if (isValid && typeof onValid === 'function') {
				onValid()
			}
			if (!isValid && typeof onInvalid === 'function') {
				onInvalid()
			}
		} catch (err) {
			addToast({
				type: 'cancel',
				label: translate('ERR_VALIDATING_QUICK_RECOVERY', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}

		updateSpinner(validateId, false)(dispatch)
	}
}

export function validateStandardLogin({ validateId, dirty }) {
	return async function(dispatch, getState) {
		updateSpinner(validateId, true)(dispatch)
		try {
			const identity = selectIdentity(getState())
			const { wallet, identityContractAddress } = identity
			const { address } = wallet

			const identityDataSplit = (identityContractAddress || '').split('-')
			const identityData = {
				address: identityDataSplit[0],
				privileges: parseInt(identityDataSplit[1] || 0),
			}

			updateIdentity('wallet', wallet)(dispatch)
			updateIdentity('walletAddr', address)(dispatch)
			updateIdentity('identityData', identityData)(dispatch)

			const isValid = !!identityData.address

			validate(validateId, 'identityContractAddress', {
				isValid: isValid,
				err: { msg: 'ERR_EXTERNAL_WALLET_LOGIN' },
				dirty: dirty,
			})(dispatch)

			if (isValid) {
				await login()(dispatch, getState)
			}
		} catch (err) {
			addToast({
				type: 'cancel',
				label: translate('ERR_VALIDATING_STANDARD_LOGIN', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}

		updateSpinner(validateId, false)(dispatch)
	}
}
