import { ADD_CAMPAIGN, DELETE_CAMPAIGN } from '../constants/actionTypes';
import initialState from './../store/tempInitialState';
import Campaign from './../models/Campaign';

export default function advertiserReducer(state = initialState.campaigns, action) {
    let newState
    let newCampaign
    let newMeta

    const campaigns = (state = [], action) => {
        if (!action.id) return state
        return [
            ...state.slice(0, action.id),
            action.campaign,
            ...state.slice(action.id + 1)
        ]
    }

    switch (action.type) {
        case ADD_CAMPAIGN:
            let campaign = action.campaign
            let id = state.length

            newCampaign = new Campaign(state._addr,
                id,
                campaign._name,
                campaign._meta.from,
                campaign._meta.to,
                campaign._meta.img,
                campaign._meta.description)

            action.id = id

            newState = campaigns(state, { ...action, campaign: newCampaign })

            return newState

        case DELETE_CAMPAIGN:
            newCampaign = state[action.id].getClone()  //TODO: check for possible memory leak
            newMeta = { ...newCampaign._meta }
            newMeta.deleted = true
            newCampaign._meta = newMeta

            newState = campaigns(state, { ...action, campaign: newCampaign })

            return newState

        default:
            return state
    }
}
