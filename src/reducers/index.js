import account from './accountReducer'
import signin from './signinReducer'
import identity from './identityReducer'
import wallet from './walletReducer'
import spinners from './spinnersReducer'
import ui from './uiReducer'
import uiMemory from './uiMemoryReducer'
import toasts from './toastsReducer'
import confirm from './confirmReducer'
import nav from './navReducer'
import language from './languageReducer'
import validations from './validateItemsReducer'
import newTransactions from './newTransactionsReducer'
import config from './configReducer'
import ensAddresses from './ensReducer'
import tablesState from './tablesStateReducer'
import network from './networkReducer'
import { filterActions } from 'redux-ignore'
import * as types from 'constants/actionTypes'

export const persistReducers = {
	account,
	ui, //: filterActions(ui, [types.UPDATE_UI]),
	language,
	config,
	ensAddresses,
	tablesState,
	network,
}

export const memoryReducers = {
	uiMemory,
	signin,
	identity,
	wallet,
	spinners: filterActions(spinners, [types.UPDATE_SPINNER]),
	toasts,
	confirm: filterActions(confirm, [types.CONFIRM_ACTION]),
	nav: filterActions(nav, [types.UPDATE_NAV]),
	validations,
	newTransactions,
}
