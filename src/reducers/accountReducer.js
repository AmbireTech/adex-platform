import { ADD_CAMPAIGN, DELETE_CAMPAIGN } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './../store/tempInitialState';
import Campaign from './../models/Campaign';
import {ItemsTypes} from './../constants/itemsTypes'

export default function accountReducer(state = initialState.account, action){
    let newState
    let newItems
    
    switch(action.type){
        case ADD_CAMPAIGN:
            newState = objectAssign({}, state) 

            let campaign = objectAssign({}, action.campaign)
            let newCampaign = new Campaign(state._addr, 
                state._items[ItemsTypes.Campaign.id].length + 1,
                campaign._name, 
                campaign._meta.from, 
                campaign._meta.to, 
                campaign._meta.img, 
                campaign._meta.description)
                
            newState._items = newItems
            return newState

        case DELETE_CAMPAIGN:

            // TODO: WTF
            newState = {
                ...state,
                _items: {
                    ...state._items,
                    [ItemsTypes.Campaign.id]:[
                        ...state._items[ItemsTypes.Campaign.id].slice(0, action.id),
                        objectAssign({}, state._items[ItemsTypes.Campaign.id][action.id], 
                            {_meta: {deleted: true}} ),
                        ...state._items[ItemsTypes.Campaign.id].slice(action.id + 1)
                    ]
                }
            }

            return newState

        default:
            return state
    }
}
