import { combineReducers } from 'redux'
import account from './accountReducer'
import items from './itemsReducer'
import newItem from './newItemsReducer'
import currentItem from './currentItemsReducer'
import spinners from './spinnersReducer'
import { routerReducer } from 'react-router-redux'

const rootReducer = combineReducers({
    account: account,
    items: items,
    newItem: newItem,
    currentItem: currentItem,
    spinners: spinners,
    routing: routerReducer
});

export default rootReducer;
