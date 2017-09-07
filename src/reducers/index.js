import { combineReducers } from 'redux';
// import account from './accountReducer';
import account from './advertiserReducer';
import newItem from './itemsReducer';
import {routerReducer} from 'react-router-redux';

const rootReducer = combineReducers({
    account: account,
    newItem: newItem,
    routing: routerReducer
});

export default rootReducer;
