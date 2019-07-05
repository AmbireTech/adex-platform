import initialState from 'store/initialState'
import { CHANGE_LANGUAGE } from 'constants/actionTypes'
import { setLang } from 'services/translations/translations'

export default function languageReducer(state = initialState.language, action) {
	switch (action.type) {
	case CHANGE_LANGUAGE:
		let newLang = action.lang || state
		setLang(newLang)
		return newLang
	default:
		return state
	}
}
