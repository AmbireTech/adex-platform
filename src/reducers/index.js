import { combineReducers } from 'redux'
import account from './accountReducer'
import items from './itemsReducer'
import newItem from './newItemsReducer'
// import currentItem from './currentItemsReducer'
import spinners from './spinnersReducer'
import ui from './uiReducer'
import toasts from './toastsReducer'
import { routerReducer, LOCATION_CHANGE, CALL_HISTORY_METHOD } from 'react-router-redux'
import { filterActions } from 'redux-ignore'
import * as types from './../constants/actionTypes'

const rootReducer = combineReducers({
    account: account,
    items: filterActions(items, (action => action.type.match(/_ITEM/)) ),// items,
    newItem: filterActions(newItem, (action => action.type.match(/_NEWITEM/)) ), // newItem,
    // currentItem: currentItem,
    spinners: filterActions(spinners, [types.UPDATE_SPINNER]), //spinners,
    ui: filterActions(ui, [types.UPDATE_UI]), //ui,
    toasts: toasts,
    routing: filterActions(routerReducer, [LOCATION_CHANGE, CALL_HISTORY_METHOD]), //routerReducer
});

export default rootReducer;
