import { UPDATE_RELAYER_CFG } from 'constants/actionTypes'
import initialState from 'store/initialState'

const updateCfg = (current, type, cfg) => {
	const newCfg = { ...current }
	newCfg[type] = { ...cfg }
	return newCfg
}

export default function uiReducer(state = initialState.config, action) {
	switch (action.type) {
		case UPDATE_RELAYER_CFG:
			return updateCfg(state, 'relayer', action.cfg)
		default:
			return state
	}
}
