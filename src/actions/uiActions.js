import * as types from 'constants/actionTypes'
import Helper from 'helpers/miscHelpers'

export function updateSpinner(item, value) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_SPINNER,
			spinner: item,
			value: value,
		})
	}
}

export function updateUi(item, value, category) {
	return function(dispatch) {
		return dispatch({
			type: types.UPDATE_UI,
			item: item,
			value: value,
			category: category,
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
	{ confirmLabel = '', cancelLabel = '', title = '', text = '' } = {},
	noActionBtns,
	active
) {
	return function(dispatch) {
		return dispatch({
			type: types.CONFIRM_ACTION,
			confirm: {
				onConfirm: onConfirm,
				onCancel: onCancel,
				data: {
					confirmLabel: confirmLabel,
					cancelLabel: cancelLabel,
					title: title,
					text: text,
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
