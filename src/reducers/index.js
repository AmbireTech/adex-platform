import account from './accountReducer'
import signin from './signinReducer'
import identity from './identityReducer'
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
import bids from './bidsReducer'
import newBid from './newBidsReducer'
import newTransactions from './newTransactionsReducer'
import web3Transactions from './web3TransactionsReducer'
import tags from './tagsReducer'
import { routerReducer, LOCATION_CHANGE, CALL_HISTORY_METHOD } from 'react-router-redux'
import { filterActions } from 'redux-ignore'
import * as types from 'constants/actionTypes'

export const persistReducers = {
    // signin: signin,
    account: account,
    items: filterActions(items, (action => action.type.match(/_ITEM/))),
    // newItem: filterActions(newItem, (action => action.type.match(/_NEWITEM/))),
    // spinners: filterActions(spinners, [types.UPDATE_SPINNER]),
    ui: filterActions(ui, [types.UPDATE_UI]),
    // toasts: toasts,
    // confirm: filterActions(confirm, [types.CONFIRM_ACTION]),
    // nav: filterActions(nav, [types.UPDATE_NAV]),
    // routing: filterActions(routerReducer, [LOCATION_CHANGE, CALL_HISTORY_METHOD]),
    language: language,
    // validations: validations,
    bids: bids,
    web3Transactions: web3Transactions,
    tags: tags
}

export const memoryReducers = {
    signin: signin,
    identity: identity,
    // account: account,
    // items: filterActions(items, (action => action.type.match(/_ITEM/))),
    newItem: filterActions(newItem, (action => action.type.match(/_NEWITEM/))),
    spinners: filterActions(spinners, [types.UPDATE_SPINNER]),
    // ui: filterActions(ui, [types.UPDATE_UI]),
    toasts: toasts,
    confirm: filterActions(confirm, [types.CONFIRM_ACTION]),
    nav: filterActions(nav, [types.UPDATE_NAV]),
    routing: filterActions(routerReducer, [LOCATION_CHANGE, CALL_HISTORY_METHOD]),
    // language: language,
    validations: validations,
    // bids: bids,
    newBid: newBid,
    newTransactions: newTransactions
}
