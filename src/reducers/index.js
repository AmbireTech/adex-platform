import { combineReducers } from 'redux'
import account from './accountReducer'
import campaigns from './campaignsReducer'
import units from './unitsReducer'
import newItem from './itemsReducer'
import {routerReducer} from 'react-router-redux'

const rootReducer = combineReducers({
    account: account,
    campaigns: campaigns,
    units: units,
    newItem: newItem,
    routing: routerReducer
});

export default rootReducer;
