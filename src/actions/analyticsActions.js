import * as types from 'constants/actionTypes'
import { addToast, removeToast, confirmAction } from './uiActions'
import { translate } from 'services/translations/translations'
import {
	getValidatorAuthToken,
	identityAnalytics,
} from 'services/adex-validator/actions'
import { updateValidatorAuthTokens } from './accountActions'
import {
	VALIDATOR_ANALYTICS_SIDES,
	VALIDATOR_ANALYTICS_EVENT_TYPES,
	VALIDATOR_ANALYTICS_METRICS,
	VALIDATOR_ANALYTICS_TIMEFRAMES,
} from 'constants/misc'

const VALIDATOR_LEADER_ID = process.env.VALIDATOR_LEADER_ID

const analyticsParams = () => {
	const callsParams = []

	VALIDATOR_ANALYTICS_SIDES.forEach(side =>
		VALIDATOR_ANALYTICS_EVENT_TYPES.forEach(eventType =>
			VALIDATOR_ANALYTICS_METRICS.forEach(metric =>
				VALIDATOR_ANALYTICS_TIMEFRAMES.forEach(timeframe => {
					callsParams.push({
						metric,
						timeframe: timeframe.value,
						side,
						eventType,
					})
				})
			)
		)
	)

	return callsParams
}

// getIdentityStatistics tooks to long some times
// if the account is change we do not update the account
// TODO: we can use something for abortable tasks
function checkAccountChanged(getState, account) {
	const accountCheck = getState().persist.account
	const accountChanged =
		!accountCheck.wallet.address ||
		accountCheck.wallet.address !== account.wallet.address ||
		!accountCheck.identity.address ||
		!accountCheck.identity.address !== !account.identity.address

	return accountChanged
}

export function updateAccountAnalytics(KOR) {
	return async function(dispatch, getState) {
		const { account } = getState().persist
		try {
			const toastId = addToast({
				type: 'warning',
				label: translate('SIGN_VALIDATORS_AUTH'),
				timeout: false,
				unclosable: true,
				top: true,
			})(dispatch)

			const leaderAuth = await getValidatorAuthToken({
				validatorId: VALIDATOR_LEADER_ID,
				account,
			})

			removeToast(toastId)(dispatch)

			updateValidatorAuthTokens({
				newAuth: { [VALIDATOR_LEADER_ID]: leaderAuth },
			})(dispatch, getState)

			const params = analyticsParams()
			let accountChanged = false
			const allAnalytics = params.map(async opts => {
				identityAnalytics({
					...opts,
					leaderAuth,
				})
					.then(res => {
						accountChanged =
							accountChanged || checkAccountChanged(getState, account)

						if (!accountChanged) {
							dispatch({
								type: types.UPDATE_ANALYTICS,
								...opts,
								value: { ...res },
							})
						}
					})
					.catch(err => {
						console.error('ERR_ANALYTICS_SINGLE', err)
					})
			})

			await Promise.all(allAnalytics)
		} catch (err) {
			console.error('ERR_ANALYTICS', err)
			addToast({
				type: 'cancel',
				label: translate('ERR_ANALYTICS', { args: [err] }),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function resetAnalytics() {
	return async function(dispatch, getState) {
		return dispatch({
			type: types.RESET_ANALYTICS,
		})
	}
}
