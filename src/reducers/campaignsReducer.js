import { ADD_CAMPAIGN, DELETE_CAMPAIGN } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './../store/tempInitialState';
import Campaign from './../models/Campaign'

export default function campaignsReducer(state = initialState.account, action){
    let newState
    let newItems
    
    switch(action.type){
        case ADD_CAMPAIGN:
            newState = objectAssign({}, state) 

            let campaign = objectAssign({}, action.campaign)
            let newCampaign = new Campaign(newState.id, campaign.name, campaign.from, campaign.to, campaign.img, campaign.description)
            newItems = [...newState._items, newCampaign]
            newState._items = newItems
            return newState

        case DELETE_CAMPAIGN:
            newState = objectAssign({}, state)
            newItems = [...newState._items]
            newItems = newItems
                .filter((i)=> i._id !== action.id)
                .map((i)=> objectAssign({}, i))
            
            newState._items = newItems

            return newState

        default:
            return state
    }
}
