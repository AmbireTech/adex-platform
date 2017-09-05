import { combineReducers } from 'redux';
import account from './accountReducer';
import newItem from './itemsReducer';
import {routerReducer} from 'react-router-redux';

const rootReducer = combineReducers({
    account: account,
    newItem: newItem,
    routing: routerReducer
});

export default rootReducer;
