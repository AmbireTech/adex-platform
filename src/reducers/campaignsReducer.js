import { ADD_CAMPAIGN } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './../store/tempInitialState';
import Campaign from './../models/Campaign'

export default function campaignsReducer(state = initialState.account, action){
    let newState

    switch(action.type){
        case ADD_CAMPAIGN:
            newState = objectAssign({}, state) 
            let campaign = action.campaign
            let newCampaign = new Campaign(campaign.owner, campaign.name, campaign.from, campaign.to, campaign.img, campaign.description)

            newState.items.push(newCampaign)

            return newState

        default:
            return state
    }
}
