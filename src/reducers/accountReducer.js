import {
	CREATE_ACCOUNT,
	RESET_ACCOUNT,
	UPDATE_ACCOUNT,
} from '../constants/actionTypes'
import initialState from 'store/initialState'

function plainDeepCopy(obj) {
	const plain = Object.assign({}, obj)
	const deepCopy = JSON.parse(JSON.stringify(plain))
	return deepCopy
}

function updateObject({ currentObj, newValues = {} } = {}) {
	const newData = Object.assign({}, newValues)
	const newItem = plainDeepCopy(currentObj)

	for (const key in newData) {
		if (newData.hasOwnProperty(key) && key in newItem) {
			let value = newData[key]

			if (value instanceof Date) {
				value = value.getTime()
			}

			if (Array.isArray(value)) {
				value = [...value]
			} else if (!!value && typeof value === 'object') {
				value = Object.assign({}, value)
			}

			newItem[key] = value
		}
	}

	const plainObj = plainDeepCopy(newItem)

	return plainObj
}

export default function accountReducer(state = initialState.account, action) {
	let newState
	let newAccount

	newState = { ...state }

	switch (action.type) {
		case CREATE_ACCOUNT:
			newAccount = { ...action.account }
			newState = newAccount
			return newState
		case RESET_ACCOUNT:
			newAccount = initialState.account
			newState = newAccount
			return newState
		case UPDATE_ACCOUNT:
			newAccount = updateObject({
				currentObj: newState,
				newValues: { ...action.newValues },
			})
			newState = newAccount
			return newState

		default:
			return state
	}
}
