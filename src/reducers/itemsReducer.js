import { UPDATE_NEW_CAMPAIGN, RESET_NEW_CAMPAIGN, UPDATE_NEW_UNIT, RESET_NEW_UNIT } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './../store/tempInitialState';
// import Campaign from './../models/Campaign'

export default function accountReducer(state = initialState.newItem, action) {
    let newState
    let meta
    // let newItems

    switch (action.type) {
        case UPDATE_NEW_CAMPAIGN:
            newState = objectAssign({}, state)
            let newCampaign = objectAssign({}, newState.campaign)
            let campaign = action.campaign
            meta = objectAssign({}, newCampaign._meta)

            newCampaign._name = campaign.name || newCampaign._name
            meta.from = campaign.from || newCampaign._meta.from
            meta.to = campaign.to || newCampaign._meta.to
            meta.img = campaign.img || newCampaign._meta.img
            meta.description = campaign.description || newCampaign._meta.description

            newCampaign._meta = meta

            // console.log('newCampaign name', newCampaign)
            newState.campaign = newCampaign
            return newState

        case RESET_NEW_CAMPAIGN:
            newState = objectAssign({}, state)
            let newCamp = initialState.newItem.campaign
            newState.campaign = newCamp
            return newState

        case UPDATE_NEW_UNIT:
            newState = objectAssign({}, state)
            let newUnit = objectAssign({}, state.unit)
            let unit = action.unit
            console.log('action.unit', unit)
            
            meta = objectAssign({}, newUnit._meta)

            newUnit._name = unit.name || newUnit._name
            meta.img = unit.img || newUnit._meta.img
            meta.description = unit.description || newUnit._meta.description

            newUnit._meta = meta

            newState.unit = newUnit
            return newState

        case RESET_NEW_UNIT:
            newState = objectAssign({}, state)
            let newUnt = initialState.newItem.unit
            newState.unit = newUnt
            return newState

        default:
            return state
    }
}
