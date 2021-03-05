import project from './projectReducer'
import account from './accountReducer'
import signin from './signinReducer'
import identity from './identityReducer'
import wallet from './walletReducer'
import items from './itemsReducer'
import newItem from './newItemsReducer'
// import currentItem from './currentItemsReducer'
import spinners from './spinnersReducer'
import ui from './uiReducer'
import uiMemory from './uiMemoryReducer'
import toasts from './toastsReducer'
import confirm from './confirmReducer'
import nav from './navReducer'
import language from './languageReducer'
import validations from './validateItemsReducer'
import newTransactions from './newTransactionsReducer'
import web3Transactions from './web3TransactionsReducer'
import targeting from './targetingReducer'
import config from './configReducer'
import analytics from './analyticsReducer'
import channels from './channelsReducer'
import selectedItems from './selectedItemsReducer'
import ensAddresses from './ensReducer'
import tablesState from './tablesStateReducer'
import { filterActions } from 'redux-ignore'
import * as types from 'constants/actionTypes'

export const persistReducers = {
	project,
	account,
	ui, //: filterActions(ui, [types.UPDATE_UI]),
	items: filterActions(items, action => action.type.match(/_ITEM/)),
	language,
	web3Transactions,
	targeting,
	config,
	ensAddresses,
	tablesState,
}

export const memoryReducers = {
	uiMemory,
	channels,
	analytics,
	signin,
	identity,
	wallet,
	newItem: filterActions(newItem, action => action.type.match(/_NEWITEM/)),
	spinners: filterActions(spinners, [types.UPDATE_SPINNER]),
	toasts,
	confirm: filterActions(confirm, [types.CONFIRM_ACTION]),
	nav: filterActions(nav, [types.UPDATE_NAV]),
	validations,
	selectedItems,
	newTransactions,
}
