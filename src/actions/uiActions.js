import React from 'react'
import Button from '@material-ui/core/Button'
import * as types from 'constants/actionTypes'
import Helper from 'helpers/miscHelpers'
import {
	selectCompanyData,
	selectAccountIdentityAddr,
	selectIdentitySideAnalyticsTimeframe,
	selectIdentitySideAnalyticsPeriod,
	selectSide,
	selectMemoryUi,
	selectAnalyticsLiveTimestamp,
	selectAnalyticsMinAndMaxDates,
	t,
} from 'selectors'
import {
	getTimePeriods,
	getBorderPeriodStart,
} from 'helpers/analyticsTimeHelpers'
import { getErrorMsg } from 'helpers/errors'

export function updateSpinner(item, value) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_SPINNER,
			spinner: item,
			value: value,
		})
	}
}

export function updateGlobalUi(item, value, category) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_GLOBAL_UI,
			item: item,
			value: value,
			category: category,
		})
	}
}

export function updateMemoryUi(item, value) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_MEMORY_UI,
			item: item,
			value: value,
		})
	}
}

export function updateInitialDataLoaded(dataType, loaded) {
	return function(dispatch, getState) {
		const { initialDataLoaded } = selectMemoryUi(getState())
		if (initialDataLoaded !== true) {
			const newData = { ...(initialDataLoaded || {}) }
			newData[dataType] = loaded
			return dispatch({
				type: types.UPDATE_MEMORY_UI,
				item: 'initialDataLoaded',
				value: newData,
			})
		}
	}
}

export function updateUiByIdentity(item, value, category) {
	return function(dispatch, getState) {
		const identity = selectAccountIdentityAddr(getState())

		return dispatch({
			type: types.UPDATE_UI_BY_IDENTITY,
			identity,
			item: item,
			value: value,
			category: category,
		})
	}
}

export function updateIdentitySideUi(item, value) {
	return function(dispatch, getState) {
		const state = getState()
		const identity = selectAccountIdentityAddr(state)
		const side = selectSide(state)
		return dispatch({
			type: types.UPDATE_UI_BY_IDENTITY_AND_SIDE,
			identity,
			item,
			value,
			side,
		})
	}
}

export function addToast({
	type,
	action,
	label = '',
	timeout = false,
	unclosable,
	anchorOrigin,
	top,
}) {
	return function(dispatch) {
		const id = Helper.getGuid()
		dispatch({
			type: types.ADD_TOAST,
			toast: {
				type,
				action,
				label,
				timeout,
				unclosable,
				anchorOrigin,
				top,
				id,
			},
		})

		return id
	}
}

export function removeToast(toastId) {
	return function(dispatch) {
		return dispatch({
			type: types.REMOVE_TOAST,
			toast: toastId,
		})
	}
}

export function confirmAction(
	onConfirm,
	onCancel,
	{
		confirmLabel = '',
		cancelLabel = '',
		title = '',
		text = '',
		noCancel = false,
		noConfirm = false,
	} = {},
	noActionBtns,
	active
) {
	return async function(dispatch) {
		return await dispatch({
			type: types.CONFIRM_ACTION,
			confirm: {
				onConfirm: onConfirm,
				onCancel: onCancel,
				data: {
					confirmLabel: confirmLabel,
					cancelLabel: cancelLabel,
					title: title,
					text: text,
					noCancel: noCancel,
					noConfirm: noConfirm,
				},
				noActionBtns,
				active,
			},
		})
	}
}

export function updateNav(item, value) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_NAV,
			item: item,
			value: value,
		})
	}
}

export function changeLanguage(lang) {
	return function(dispatch) {
		return dispatch({
			type: types.CHANGE_LANGUAGE,
			lang: lang,
		})
	}
}

export function updateRegistrationAllowed(search) {
	return function(dispatch) {
		const searchParams = new URLSearchParams(search)
		if (searchParams.get('eddie') === 'themoonicorn') {
			updateGlobalUi('allowRegistration', true)(dispatch)
		}
	}
}

export function updateCompanyData(newData) {
	return async function(dispatch, getState) {
		try {
			const companyData = selectCompanyData(getState())
			const newCompanyData = { ...companyData, ...newData }
			updateUiByIdentity('companyData', newCompanyData)(dispatch, getState)
		} catch (err) {
			console.error('ERR_UPDATING_COMPANY_DATA', err)
			addToast({
				type: 'cancel',
				label: t('ERR_UPDATING_COMPANY_DATA'),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function updateSelectedItems(collection, selectedItems) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_SELECTED_ITEMS,
			selectedItems,
			collection,
		})
	}
}

export function resetSelectedItems() {
	return function(dispatch) {
		return dispatch({
			type: types.RESET_SELECTED_ITEMS,
		})
	}
}

export function updateSelectedCampaigns(selectedItems) {
	return function(dispatch) {
		return updateSelectedItems('campaigns', selectedItems)(dispatch)
	}
}

export function updateNewVersion({ shouldForceRefresh, version }) {
	return async function(dispatch, getState) {
		await updateGlobalUi('newVersionAvailable', shouldForceRefresh)(dispatch)
		await updateGlobalUi('selectNewVersionAvailableId', version)(dispatch)
	}
}

export function refreshCacheAndReload({ version }) {
	return async function(dispatch, getState) {
		if (caches) {
			// Service worker cache should be cleared with caches.delete()
			caches.keys().then(async function(names) {
				await Promise.all(names.map(name => caches.delete(name)))
			})
		}

		await updateNewVersion({ shouldForceRefresh: false, version })(
			dispatch,
			getState
		)
		window.location.reload(true)
	}
}

export function notifyNewTOS() {
	return function(dispatch) {
		try {
			addToast({
				type: 'accept',
				unclosable: true,
				action: (
					// eslint-disable-next-line react/react-in-jsx-scope
					<Button
						color='primary'
						size='small'
						variant='contained'
						onClick={() => {
							window.open('https://www.adex.network/tos', '_blank')
							window.location.reload(true)
						}}
					>
						{t('TOS_CHECK')}
					</Button>
				),
				label: t('NOTIFICATION_NEW_TOS', {
					args: [t('TOS_CHECK')],
				}),
				timeout: 5000,
			})(dispatch)
		} catch (err) {
			console.error('ERR_UPDATING_APP', err)
			addToast({
				type: 'cancel',
				label: t('ERR_UPDATING_APP'),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function handleRedirectParams(search) {
	return function(dispatch) {
		const searchParams = new URLSearchParams(search)

		const email = searchParams.get('confirm-email')
		const identity = searchParams.get('confirm-identity')
		const grant = searchParams.get('confirm-grant')
		const side = (searchParams.get('go-to-side') || '').toLowerCase()
		const selectedIdentity = searchParams.get('login-select-identity')

		if (email && identity && !grant) {
			addToast({
				type: 'accept',
				label: t('CONFIRM_IDENTITY_EMAIL', {
					args: [email, identity],
				}),
				timeout: 20000,
			})(dispatch)
		} else if (email && identity && grant) {
			addToast({
				type: 'accept',
				label: t('CONFIRM_IDENTITY_EMAIL_GRANT', {
					args: [email, identity, grant],
				}),
				timeout: 20000,
			})(dispatch)
		}

		if (['advertiser', 'publisher'].includes(side)) {
			updateGlobalUi('goToSide', side)(dispatch)
		}

		if (!!selectedIdentity) {
			updateMemoryUi('loginSelectedIdentity', selectedIdentity)(dispatch)
		}
	}
}

export function updateEasterEggsAllowed(search) {
	return function(dispatch) {
		const searchParams = new URLSearchParams(search)

		if (
			searchParams.get(process.env.EASTER_EGGS_PARAM) ===
			process.env.EASTER_EGGS_VALUE
		) {
			updateGlobalUi('allowEasterEggs', true)(dispatch)
		}
	}
}

export function updatePrivilegesWarningAccepted(accepted) {
	return function(dispatch, getState) {
		updateUiByIdentity('privilegesWarningAccepted', accepted)(
			dispatch,
			getState
		)
	}
}

export function hideGettingStarted(side) {
	return function(dispatch, getState) {
		updateUiByIdentity('hideGettingStarted', true, side)(dispatch, getState)
	}
}

export function setGettingStartedExpanded(expanded) {
	return function(dispatch, getState) {
		updateUiByIdentity('gettingStartedExpanded', expanded)(dispatch, getState)
	}
}

export function updateIdSideAnalyticsChartPeriod(periodStart) {
	return function(dispatch, getState) {
		const state = getState()
		const timeframe = selectIdentitySideAnalyticsTimeframe(state)
		const { start, end, callEnd } = getTimePeriods({
			timeframe,
			start: periodStart,
		})
		updateIdentitySideUi('sideAnalyticsPeriod', { start, end, callEnd })(
			dispatch,
			getState
		)
	}
}

export function updateAnalyticsPeriodPrevNextLive({
	next = false,
	live = false,
}) {
	return async function(dispatch, getState) {
		try {
			const state = getState()
			const { minDate, maxDate } = selectAnalyticsMinAndMaxDates(state)
			const timeframe = selectIdentitySideAnalyticsTimeframe(state)
			let { start } = selectIdentitySideAnalyticsPeriod(state)

			if (live) {
				start = selectAnalyticsLiveTimestamp(state)
			} else {
				const startIsLive = start === selectAnalyticsLiveTimestamp(state)
				start = getBorderPeriodStart({
					timeframe,
					start,
					next,
					startIsLive,
					minDate,
					maxDate,
				})
			}

			updateIdSideAnalyticsChartPeriod(start)(dispatch, getState)
		} catch (err) {
			console.error('ERR_ANALYTICS_PREV_PERIOD', err)
			addToast({
				type: 'cancel',
				label: t('ERR_ANALYTICS_PREV_PERIOD', {
					args: [getErrorMsg(err)],
				}),
				timeout: 20000,
			})(dispatch)
		}
	}
}

export function updateIdSideAnalyticsChartTimeframe(timeframe) {
	return function(dispatch, getState) {
		updateIdentitySideUi('sideAnalyticsTimeframe', timeframe)(
			dispatch,
			getState
		)
		updateAnalyticsPeriodPrevNextLive({ live: true })(dispatch, getState)
	}
}

export function updateWindowReloading(isReloading) {
	return function(dispatch, getState) {
		updateMemoryUi('windowReloading', isReloading)(dispatch, getState)
	}
}

export function updateTableState(tableId, tableState) {
	return function(dispatch, getState) {
		// TODO: filter state - only essential stuff
		const filteredState = (({
			rowsPerPage,
			page,
			activeColumn,
			filterList,
			searchProps,
			searchText,
			rowsSelected,
			sortOrder,
			viewColumnsState,
		}) => ({
			rowsPerPage,
			page,
			activeColumn,
			filterList,
			searchProps,
			searchText,
			rowsSelected,
			sortOrder,
			viewColumnsState,
		}))(tableState)
		const identity = selectAccountIdentityAddr(getState())

		return dispatch({
			type: types.UPDATE_TABLE_STATE,
			identity,
			tableId: tableId,
			value: filteredState,
		})
	}
}

export function resetAllTableState() {
	return function(dispatch, _getState) {
		return dispatch({
			type: types.RESET_ALL_TABLES_STATE,
		})
	}
}

export function resetTableStateById(tableId) {
	return function(dispatch, getState) {
		const identity = selectAccountIdentityAddr(getState())
		return dispatch({
			type: types.RESET_TABLE_STATE_BY_ID,
			identity,
			tableId,
		})
	}
}
