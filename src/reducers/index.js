import account from './accountReducer'
import signin from './signinReducer'
import identity from './identityReducer'
import wallet from './walletReducer'
import items from './itemsReducer'
import newItem from './newItemsReducer'
// import currentItem from './currentItemsReducer'
import spinners from './spinnersReducer'
import ui from './uiReducer'
import toasts from './toastsReducer'
import confirm from './confirmReducer'
import nav from './navReducer'
import language from './languageReducer'
import validations from './validateItemsReducer'
import newTransactions from './newTransactionsReducer'
import web3Transactions from './web3TransactionsReducer'
import tags from './tagsReducer'
import ethNetwork from './ethNetworkReducer'
import analytics from './analyticsReducer'
import { filterActions } from 'redux-ignore'
import * as types from 'constants/actionTypes'

export const persistReducers = {
	account,
	items: filterActions(items, action => action.type.match(/_ITEM/)),
	ui: filterActions(ui, [types.UPDATE_UI]),
	language,
	web3Transactions,
	tags,
	ethNetwork,
	analytics,
}

export const memoryReducers = {
	signin,
	identity,
	wallet,
	newItem: filterActions(newItem, action => action.type.match(/_NEWITEM/)),
	spinners: filterActions(spinners, [types.UPDATE_SPINNER]),
	toasts,
	confirm: filterActions(confirm, [types.CONFIRM_ACTION]),
	nav: filterActions(nav, [types.UPDATE_NAV]),
	validations,
	newTransactions,
}
