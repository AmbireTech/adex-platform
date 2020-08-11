import * as types from 'constants/actionTypes'
import { getQuickWallet } from 'services/adex-relayer/actions'
import { updateSpinner, addToast, handleAfterValidation } from 'actions'
import {
	getOwnerIdentities,
	regAccount,
	getIdentityData,
} from 'services/adex-relayer/actions'
import { createSession } from './accountActions'
import { getIdentityDeployData } from 'services/smart-contracts/actions/identity'
import {
	addDataToWallet,
	getWalletHash,
	getLocalWallet,
	migrateLegacyWallet,
	walletInfo,
	createLocalWallet,
	generateSalt,
} from 'services/wallet/wallet'
import { saveToLocalStorage } from 'helpers/localStorageHelpers'
import {
	selectLoginSelectedIdentity,
	selectIdentity,
	selectAuthType,
	t,
} from 'selectors'
import { AUTH_TYPES } from 'constants/misc'
import {
	validate,
	validateEmail,
	validateEmailCheck,
	validatePassword,
	validatePasswordCheck,
	validateTOS,
	validateWallet,
	validateIdentityContractOwner,
	validateAccessWarning,
	validateKnowFrom,
	validateMoreInfo,
} from './validationActions'
import { getErrorMsg } from 'helpers/errors'
import {
	GETTING_OWNER_IDENTITIES,
	UPLOADING_ACCOUNT_DATA,
	CHECKING_METAMASK_AUTH,
	AUTH_WAITING_TREZOR_ACTION,
	AUTH_WAITING_ADDRESS_DATA,
} from 'constants/spinners'
import { getEthers } from 'services/smart-contracts/ethers'
import { getSigner } from 'services/smart-contracts/actions/ethers'
import { getAddressBalances } from 'services/smart-contracts/actions/stats'

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

export function onUploadLocalWallet(event) {
	return async function(dispatch) {
		updateSpinner(UPLOADING_ACCOUNT_DATA, true)(dispatch)
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
					throw new Error(t('INVALID_JSON_DATA'))
				} else {
					saveToLocalStorage(obj.wallet, obj.key)
					updateIdentity('uploadedLocalWallet', obj.key)(dispatch)
					addToast({
						type: 'accept',
						label: t('SUCCESS_UPLOADING_ACCOUNT_DATA'),
						timeout: 5000,
					})(dispatch)
				}
			} catch (err) {
				console.error('Error uploading account json data: ', err)
				addToast({
					type: 'cancel',
					label: t('ERR_UPLOADING_ACCOUNT_DATA', {
						args: [err.message],
					}),
					timeout: 5000,
				})(dispatch)
			}
			updateSpinner(UPLOADING_ACCOUNT_DATA, true)(dispatch)
		}

		const onError = err => {
			console.error('Error uploading account data.', err)
			addToast({
				type: 'cancel',
				label: t('ERR_UPLOADING_ACCOUNT_DATA', {
					args: [getErrorMsg(err)],
				}),
				timeout: 5000,
			})(dispatch)
			updateSpinner(UPLOADING_ACCOUNT_DATA, false)(dispatch)
		}

		reader.onerror = err => {
			reader.abort()
			onError(err)
		}

		reader.onabort = ev => {
			onError(t('ABORTING_DATA_UPLOAD'))
		}

		reader.readAsText(file)
	}
}

export function updateOwnerIdentities({ owner }) {
	return async function(dispatch, getState) {
		updateSpinner(GETTING_OWNER_IDENTITIES, true)(dispatch)
		try {
			const { provider } = await getEthers(AUTH_TYPES.READONLY)
			const identityData = await getOwnerIdentities({ owner })
			const loginSelectedIdentity = selectLoginSelectedIdentity(getState())
			const data = Object.entries(identityData)
				.filter(
					x =>
						!!x &&
						!!x[0] &&
						(!!loginSelectedIdentity
							? x[0].toLowerCase() === loginSelectedIdentity.toLowerCase()
							: true)
				)
				.map(async ([identityAddr, privLevel]) => {
					try {
						const ens = await provider.lookupAddress(identityAddr)
						return {
							identity: identityAddr,
							privLevel,
							ens,
						}
					} catch {
						return null
					}
				})

			const ownerIdentities = (await Promise.all(data)).filter(x => !!x)

			updateIdentity('ownerIdentities', ownerIdentities)(dispatch)
		} catch (err) {
			console.error('ERR_GETTING_OWNER_IDENTITIES', err)
			addToast({
				type: 'cancel',
				label: t('ERR_GETTING_OWNER_IDENTITIES', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner(GETTING_OWNER_IDENTITIES, false)(dispatch)
	}
}

export function login() {
	return async function(dispatch, getState) {
		try {
			const {
				wallet,
				email,
				knowFrom,
				moreInfo,
				identityData,
				identityTxData,
				deleteLegacyKey,
				registerAccount,
			} = selectIdentity(getState())

			if (registerAccount) {
				await regAccount({
					owner: wallet.address,
					email: email.toLowerCase(),
					knowFrom,
					moreInfo,
					...identityTxData,
				})
			}

			const relayerData =
				(await getIdentityData({
					identityAddr: identityData.address,
				})) || {}
			const identity = {
				...identityData,
				address: relayerData.deployData._id,
				currentPrivileges: relayerData.currentPrivileges,
				isLimitedVolume: relayerData.isLimitedVolume,
				relayerData,
			}
			if (identity.currentPrivileges[wallet.address] > 0) {
				await createSession({
					identity,
					wallet,
					email,
					deleteLegacyKey,
				})(dispatch, getState)
			} else {
				addToast({
					type: 'cancel',
					label: t('ACCOUNT_NONE_PRIVILEGES'),
					timeout: 20000,
				})(dispatch)
			}
		} catch (err) {
			console.error('ERR_LOGIN', err)
			addToast({
				type: 'cancel',
				label: t('ERR_LOGIN', { args: [getErrorMsg(err)] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function validateQuickLogin({ validateId, dirty }) {
	return async function(dispatch, getState) {
		updateSpinner(validateId, true)(dispatch)
		const identity = selectIdentity(getState())
		const { password, email, authType } = identity

		let wallet = {}
		let error = 'INVALID_EMAIL_OR_PASSWORD'
		let actualAuthType = authType

		try {
			if (email && password) {
				let walletData = await getLocalWallet({
					email,
					password,
					authType: actualAuthType,
				})

				if (!walletData) {
					const salt = generateSalt(email)
					const hash = await getWalletHash({ salt, password })
					const { encryptedWallet } =
						(await getQuickWallet({
							hash,
						})) || {}

					const backupWallet = encryptedWallet || {}

					if (
						backupWallet.wallet &&
						backupWallet.key &&
						backupWallet.wallet.data &&
						backupWallet.wallet.identity &&
						backupWallet.wallet.privileges
					) {
						const info = walletInfo(backupWallet.key, 'backup', null)
						actualAuthType = info.authType
						saveToLocalStorage(backupWallet.wallet, backupWallet.key)

						walletData = await getLocalWallet({
							email,
							password,
							authType: actualAuthType,
						})
					}
				}

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
						await migrateLegacyWallet({ email, password })
						updateIdentity('deleteLegacyKey', true)(dispatch)
					}
				}

				updateIdentity('identityAddr', walletData ? walletData.identity : null)(
					dispatch
				)
				updateIdentity('wallet', wallet)(dispatch)
				updateIdentity('walletAddr', wallet.address)(dispatch)
				updateIdentity('identityData', wallet.identity)(dispatch)
			}
		} catch (err) {
			console.error('ERR_QUICK_WALLET_LOGIN', err)
			error = err
		}

		const isValid = !!wallet.address

		validate(validateId, 'wallet', {
			isValid,
			err: { msg: 'ERR_QUICK_WALLET_LOGIN', args: [getErrorMsg(error)] },
			dirty: dirty,
		})(dispatch)

		if (isValid) {
			await login()(dispatch, getState)
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
			console.error('ERR_VALIDATING_STANDARD_LOGIN', err)
			addToast({
				type: 'cancel',
				label: t('ERR_VALIDATING_STANDARD_LOGIN', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}

		updateSpinner(validateId, false)(dispatch)
	}
}

export function validateFullDeploy({ validateId, dirty, skipSpinnerUpdate }) {
	return async function(dispatch, getState) {
		!skipSpinnerUpdate && updateSpinner(validateId, true)(dispatch)
		const identity = selectIdentity(getState())
		const { identityAddr, email, wallet } = identity
		try {
			let isValid = !!identityAddr && !!wallet && !!email
			if (!identityAddr && wallet && !!email) {
				const walletAddr = wallet.address

				const txData = await getIdentityDeployData({ owner: walletAddr })
				const identityData = {
					address: txData.identityAddr,
					privileges: txData.privileges,
				}

				updateIdentity('identityAddr', txData.identityAddr)(dispatch)
				updateIdentity('identityTxData', txData)(dispatch)
				updateIdentity('identityData', identityData)(dispatch)

				updateIdentity('wallet', wallet)(dispatch)
				updateIdentity('walletAddr', walletAddr)(dispatch)
				updateIdentity('registerAccount', true)(dispatch)

				isValid = txData.identityAddr && !!wallet && !!email
			}

			await validate(validateId, 'identityAddr', {
				isValid,
				err: { msg: 'ERR_IDENTITY_NOT_GENERATED' },
				dirty,
			})(dispatch)

			if (isValid) {
				await login()(dispatch, getState)
			}
		} catch (err) {
			console.error('ERR_VALIDATING_FULL_DEPLOY', err)
			addToast({
				type: 'cancel',
				label: t('ERR_VALIDATING_FULL_DEPLOY', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}

		!skipSpinnerUpdate && updateSpinner(validateId, false)(dispatch)
	}
}

export function validateQuickDeploy({ validateId, dirty }) {
	return async function(dispatch, getState) {
		updateSpinner(validateId, true)(dispatch)
		const identity = selectIdentity(getState())
		const { identityAddr, email, password } = identity
		try {
			let isValid = !!identityAddr && email && password

			if (!identityAddr && email && password) {
				const authType = AUTH_TYPES.QUICK.name

				const walletData = await createLocalWallet({
					email,
					password,
					authType,
				})

				walletData.email = email
				walletData.password = password

				const walletAddr = walletData.address

				const txData = await getIdentityDeployData({ owner: walletAddr })

				const identityAddr = txData.identityAddr
				const identityData = {
					address: identityAddr,
					privileges: txData.privileges,
				}

				await addDataToWallet({
					email,
					password,
					authType,
					dataKey: 'identity',
					dataValue: identityAddr,
				})
				await addDataToWallet({
					email,
					password,
					authType,
					dataKey: 'privileges',
					dataValue: identityData.privileges,
				})

				updateIdentity('identityAddr', identityAddr)(dispatch)
				updateIdentity('identityTxData', txData)(dispatch)
				updateIdentity('identityData', identityData)(dispatch)

				updateIdentity('wallet', walletData)(dispatch)
				updateIdentity('walletAddr', walletAddr)(dispatch)
				updateIdentity('registerAccount', true)(dispatch)

				isValid = !!identityAddr
			}

			await validate(validateId, 'identityAddr', {
				isValid,
				err: { msg: 'ERR_IDENTITY_NOT_GENERATED' },
				dirty,
			})(dispatch)

			if (isValid) {
				await login()(dispatch, getState)
			}
		} catch (err) {
			console.error('ERR_VALIDATING_QUICK_DEPLOY', err)
			addToast({
				type: 'cancel',
				label: t('ERR_VALIDATING_QUICK_DEPLOY', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}

		updateSpinner(validateId, false)(dispatch)
	}
}

export function validateQuickInfo({ validateId, dirty, onValid, onInvalid }) {
	return async function(dispatch, getState) {
		const identity = selectIdentity(getState())
		const {
			email,
			emailCheck,
			password,
			passwordCheck,
			tosCheck,
			knowFrom,
			moreInfo,
		} = identity

		const validations = await Promise.all([
			validateEmail(validateId, email, dirty, true)(dispatch),
			validateEmailCheck(validateId, emailCheck, email, dirty)(dispatch),
			validatePassword(validateId, password, dirty)(dispatch),
			validatePasswordCheck(validateId, passwordCheck, password, dirty)(
				dispatch
			),
			validateKnowFrom(validateId, knowFrom, dirty)(dispatch),
			validateMoreInfo(validateId, knowFrom, moreInfo, dirty)(dispatch),
			validateTOS(validateId, tosCheck, dirty)(dispatch),
		])

		const isValid = validations.every(v => v === true)

		if (isValid) {
			updateSpinner(validateId, true)(dispatch)
			await validateQuickDeploy({ validateId, dirty, skipSpinnerUpdate: true })(
				dispatch,
				getState
			)
		}

		handleAfterValidation({ isValid, onValid, onInvalid })

		updateSpinner(validateId, false)(dispatch)
	}
}

export function validateFullInfo({ validateId, dirty, onValid, onInvalid }) {
	return async function(dispatch, getState) {
		const identity = selectIdentity(getState())
		const {
			wallet,
			identityContractOwner,
			email,
			emailCheck,
			tosCheck,
			knowFrom,
			moreInfo,
			accessWarningCheck,
		} = identity

		const validations = await Promise.all([
			// validate wallet again in case of step skip
			validateWallet(validateId, wallet, dirty)(dispatch),
			validateIdentityContractOwner(validateId, identityContractOwner, dirty)(
				dispatch
			),

			// validate step fields
			validateEmail(validateId, email, dirty, true)(dispatch),
			validateEmailCheck(validateId, emailCheck, email, dirty)(dispatch),
			validateKnowFrom(validateId, knowFrom, dirty)(dispatch),
			validateMoreInfo(validateId, knowFrom, moreInfo, dirty)(dispatch),
			validateTOS(validateId, tosCheck, dirty)(dispatch),
			validateAccessWarning(validateId, accessWarningCheck, dirty)(dispatch),
		])

		const isValid = validations.every(v => v === true)

		if (isValid) {
			updateSpinner(validateId, true)(dispatch)
			await validateFullDeploy({
				validateId,
				dirty,
				skipSpinnerUpdate: true,
			})(dispatch, getState)
		}

		// handleAfterValidation({ isValid, onValid, onInvalid })

		updateSpinner(validateId, false)(dispatch)
	}
}

export function validateContractOwner({
	validateId,
	dirty,
	onValid,
	onInvalid,
}) {
	return async function(dispatch, getState) {
		updateSpinner(validateId, true)(dispatch)

		const identity = selectIdentity(getState())
		const { identityContractOwner, wallet } = identity

		const validations = await Promise.all([
			validateWallet(validateId, wallet, dirty)(dispatch),
			validateIdentityContractOwner(validateId, identityContractOwner, dirty)(
				dispatch
			),
		])

		const isValid = validations.every(v => v === true)

		await handleAfterValidation({ isValid, onValid, onInvalid })

		updateSpinner(validateId, false)(dispatch)
	}
}

export function updateIdentityWallet({
	address,
	authType,
	hdWalletAddrPath,
	hdWalletAddrIdx,
	path,
	chainId,
	signType,
}) {
	return async function(dispatch, getState) {
		const wallet = {
			address,
			authType,
			hdWalletAddrPath,
			hdWalletAddrIdx,
			path,
			chainId,
			signType,
		}

		updateIdentity('identityContractOwner', wallet.address)(dispatch)
		updateIdentity('wallet', wallet)(dispatch)
	}
}

export function handleSignupLink(search) {
	return function(dispatch) {
		const searchParams = new URLSearchParams(search)

		const email = searchParams.get('signup-email')

		if (email) {
			updateIdentity('email', email)(dispatch)
			updateIdentity('emailCheck', email)(dispatch)
		}
	}
}

export function resolveEnsAddress({ address }) {
	return async function(dispatch, getState) {
		const state = getState()
		const authType = selectAuthType(state)
		updateSpinner(`ens-${address}`, true)(dispatch)

		try {
			const { provider } = await getEthers(authType)
			const name = await provider.lookupAddress(address)
			return dispatch({
				type: types.UPDATE_RESOLVE_ENS_ADDRESS,
				item: address,
				value: name,
			})
		} catch (err) {
			console.error('ERR_RESOLVING_ENS_ADDRESS', err)
			addToast({
				type: 'cancel',
				label: t('ERR_RESOLVING_ENS_ADDRESS', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner(`ens-${address}`, false)(dispatch)
	}
}

export function checkAuthMetamask() {
	return async function(dispatch, getState) {
		updateSpinner(CHECKING_METAMASK_AUTH, true)(dispatch)

		try {
			const authType = AUTH_TYPES.METAMASK.name
			const { provider } = await getEthers(authType)
			const wallet = {
				authType: authType,
			}

			const metamaskSigner = await getSigner({ wallet, provider })
			const address = await metamaskSigner.getAddress()
			const stats = await getAddressBalances({
				address: { address },
				getFullBalances: true,
			})

			updateIdentity('stats', stats)(dispatch, getState)

			updateIdentityWallet({
				address,
				authType: AUTH_TYPES.METAMASK.name,
				signType: AUTH_TYPES.METAMASK.signType,
			})(dispatch, getState)
		} catch (err) {
			console.error('ERR_AUTH_METAMASK', err)
			addToast({
				type: 'cancel',
				label: t('ERR_AUTH_METAMASK', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner(CHECKING_METAMASK_AUTH, false)(dispatch)
	}
}

export function connectTrezor() {
	return async function(dispatch, getState) {
		updateSpinner(AUTH_WAITING_TREZOR_ACTION, true)(dispatch)
		try {
			const { provider } = await getEthers(AUTH_TYPES.TREZOR.name)

			const wallet = {
				authType: AUTH_TYPES.TREZOR.name,
			}

			const trezorSigner = await getSigner({ provider, wallet })

			const { payload, success } = await trezorSigner.getAddresses({
				from: 0,
				to: 19,
			})

			if (success && !payload.error) {
				updateSpinner(AUTH_WAITING_ADDRESS_DATA, false)(dispatch)

				const allAddressesData = payload.map(address =>
					getAddressBalances({ address })
				)

				const results = await Promise.all(allAddressesData)

				updateIdentity('addresses', results)(dispatch, getState)
				updateIdentity('hdWalletAddrPath', trezorSigner.path)(
					dispatch,
					getState
				)
			} else throw new Error(payload.error || 'TREZOR_ERR')

			updateSpinner('AUTH_WAITING_ADDRESS_DATA', false)(dispatch)
		} catch (err) {
			console.error('ERR_AUTH_TREZOR', err)
			addToast({
				type: 'cancel',
				label: t('ERR_AUTH_TREZOR', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
		updateSpinner(AUTH_WAITING_ADDRESS_DATA, false)(dispatch)
		updateSpinner(AUTH_WAITING_TREZOR_ACTION, false)(dispatch)
	}
}

export function selectWalletAddress({
	addrData,
	hdWalletAddrIdx,
	hdWalletAddrPath,
	signType,
	authType,
}) {
	return async function(dispatch, getState) {
		const { address, path } = addrData

		updateIdentityWallet({
			address,
			authType,
			signType,
			path,
			hdWalletAddrPath,
			hdWalletAddrIdx,
		})(dispatch, getState)
	}
}
