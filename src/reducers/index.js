import { combineReducers } from 'redux'
import account from './accountReducer'
import items from './itmReducer'
import newItem from './newItemsReducer'
import {routerReducer} from 'react-router-redux'

const rootReducer = combineReducers({
    account: account,
    items: items,
    newItem: newItem,
    routing: routerReducer,
    
});

export default rootReducer;
