import { combineReducers } from 'redux';
import campaigns from './campaignsReducer';
import {routerReducer} from 'react-router-redux';

const rootReducer = combineReducers({
    campaigns,
    routing: routerReducer
});

export default rootReducer;
