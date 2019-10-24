import * as types from 'constants/actionTypes'
import { addSig, getSig } from 'services/auth/auth'
import { getSession, checkSession } from 'services/adex-market/actions'
import { relayerConfig, getGrantType } from 'services/adex-relayer/actions'
import { getValidatorAuthToken } from 'services/adex-validator/actions'
import { updateSpinner } from './uiActions'
import { translate } from 'services/translations/translations'
import { getAuthSig } from 'services/smart-contracts/actions/ethers'
import {
	getAllChannelsForIdentity,
	getAccountStats,
	getOutstandingBalance,
} from 'services/smart-contracts/actions/stats'
import { addToast, confirmAction } from './uiActions'
import { getEthers } from 'services/smart-contracts/ethers'
import { AUTH_TYPES } from 'constants/misc'
import { selectAccount, selectIdentity } from 'selectors'
import { logOut } from 'services/store-data/auth'

const UPDATE_SETTINGS_INTERVAL = 24 * 60 * 60 * 1000 // 1 hour
const VALIDATOR_LEADER_ID = process.env.VALIDATOR_LEADER_ID

// MEMORY STORAGE
export function updateSignin(prop, value) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_SIGNIN,
			prop: prop,
			value: value,
		})
	}
}

export function resetSignin() {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_SIGNIN,
		})
	}
}

// PERSISTENT STORAGE
export function createAccount(acc) {
	return function(dispatch) {
		return dispatch({
			type: types.CREATE_ACCOUNT,
			account: acc,
		})
	}
}

// LOGOUT
export function resetAccount() {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_ACCOUNT,
		})
	}
}

export function updateAccount({ meta, newValues }) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_ACCOUNT,
			meta: meta,
			newValues: newValues,
		})
	}
}

export function updateGasData({ gasData }) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_GAS_DATA,
			gasData: gasData,
		})
	}
}

export function updateAccountStats() {
	return async function(dispatch, getState) {
		const { account } = getState().persist
		try {
			const { identity, wallet, stats } = account
			const { address } = identity
			const oldAggregates = stats.aggregates

			const withBalance = await getAllChannelsForIdentity({ address })

			const outstandingBalanceDai = await getOutstandingBalance({
				wallet,
				address,
				withBalance,
			}).catch(err => {
				console.error('ERR_OUTSTANDING_BALANCES', err)
			})

			const { formatted, raw } = await getAccountStats({
				account,
				outstandingBalanceDai,
			})

			updateAccount({
				newValues: { stats: { formatted, raw, aggregates: oldAggregates } },
			})(dispatch)
		} catch (err) {
			console.error('ERR_STATS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_STATS', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function updateAccountSettings() {
	return async function(dispatch, getState) {
		const { identity, settings } = getState().persist.account
		const { grantType, updated } = settings
		const now = Date.now()
		const doUpdate =
			!grantType || now - (updated || 0) > UPDATE_SETTINGS_INTERVAL

		try {
			if (doUpdate) {
				const newSettings = { ...settings }
				newSettings.grantType = (await getGrantType({
					identity: identity.address,
				})).type
				newSettings.updated = now
				updateAccount({ newValues: { settings: newSettings } })(dispatch)
			}
		} catch (err) {
			console.error('ERR_SETTINGS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_SETTINGS', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function updateValidatorAuthTokens({ newAuth }) {
	return async function(dispatch, getState) {
		const { identity } = getState().persist.account

		const newIdentity = { ...identity }
		const newTokens = { ...(newIdentity.validatorAuthTokens || {}), ...newAuth }

		// We don't want to update account if there is no actual change
		if (
			JSON.stringify(newIdentity.validatorAuthTokens) !==
			JSON.stringify(newTokens)
		) {
			newIdentity.validatorAuthTokens = newTokens
			updateAccount({ newValues: { identity: newIdentity } })(dispatch)
		}
	}
}

export function createSession({ wallet, identity, email }) {
	return async function(dispatch) {
		updateSpinner('creating-session', true)(dispatch)
		try {
			const newWallet = { ...wallet }
			const sessionSignature =
				getSig({
					addr: newWallet.address,
					mode: newWallet.authType,
					identity: identity.address,
				}) || null

			const hasSession =
				!!sessionSignature &&
				(await checkSession({
					authSig: sessionSignature,
					skipErrToast: true,
				}))

			if (hasSession) {
				newWallet.authSig = sessionSignature
			} else {
				const {
					signature,
					mode,
					authToken,
					hash,
					typedData,
				} = await getAuthSig({ wallet: newWallet })

				const { status, expiryTime } = await getSession({
					identity: identity.address,
					mode: mode,
					signature: signature,
					authToken: authToken,
					hash,
					typedData,
					signerAddress: newWallet.address,
				})

				if (status === 'OK') {
					addSig({
						addr: wallet.address,
						sig: signature,
						mode: wallet.authType,
						expiryTime: expiryTime,
						identity: identity.address,
					})
					newWallet.authSig = signature
				}
			}

			const account = {
				email: email,
				wallet: newWallet,
				identity: { ...identity },
			}

			const leaderValidatorAuth = await getValidatorAuthToken({
				validatorId: VALIDATOR_LEADER_ID,
				account,
			})

			account.identity.validatorAuthTokens = {
				[VALIDATOR_LEADER_ID]: leaderValidatorAuth,
			}

			updateAccount({
				newValues: { ...account },
			})(dispatch)
		} catch (err) {
			console.error('ERR_GETTING_SESSION', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_GETTING_SESSION', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}

		updateSpinner('creating-session', false)(dispatch)
	}
}

export function getRelayerConfig() {
	return async function(dispatch) {
		const cfg = await relayerConfig()
		return dispatch({
			type: types.UPDATE_RELAYER_CFG,
			cfg,
		})
	}
}

async function getNetworkId() {
	const { provider } = await getEthers(AUTH_TYPES.METAMASK.name)
	const networkId = (await provider.getNetwork()).chainId

	return networkId
}

async function getAddress() {
	const { provider } = await getEthers(AUTH_TYPES.METAMASK.name)
	const address = await provider.getSigner().getAddress()

	return address
}

// TEMP
const networks = {
	1: { name: 'Mainnet', for: 'production' },
	5: { name: 'Goerli', for: 'development' },
	production: { name: 'Mainnet', for: 'production' },
	development: { name: 'Goerli', for: 'development' },
}

export function metamaskNetworkCheck({ id } = {}) {
	return async function(dispatch, getState) {
		const { persist, router } = getState()
		const { location } = router
		const { account } = persist
		const { search } = location
		const { authType } = account.wallet

		const networkId = id || (await getNetworkId())
		const isMetamaskMatters =
			authType === AUTH_TYPES.METAMASK.name ||
			(!authType && search === '?metamask')

		const network = networks[networkId] || {}

		if (process.env.NODE_ENV !== network.for && isMetamaskMatters) {
			confirmAction(
				null,
				null,
				{
					title: translate('WARNING'),
					text: translate('WATNING_METAMASK_INVALID_NETWORK', {
						args: [networks[process.env.NODE_ENV].name],
					}),
				},
				true
			)(dispatch)
		} else {
			confirmAction(null, null, {}, true, false)(dispatch)
		}
	}
}

export const onMetamaskAccountChange = accountAddress => {
	return async function(_, getState) {
		const state = getState()
		const account = selectAccount(state)
		const identity = selectIdentity(state)
		const { identityContractOwner } = identity
		const { authType } = account.wallet
		if (authType === AUTH_TYPES.METAMASK.name || !authType || !accountAddress) {
			logOut(!identityContractOwner || identityContractOwner === accountAddress)
		}
	}
}

export function metamaskAccountCheck() {
	return async function(_, getState) {
		const address = await getAddress()
		onMetamaskAccountChange(address)(_, getState)
	}
}
