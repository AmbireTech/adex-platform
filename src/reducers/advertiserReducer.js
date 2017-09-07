
import { ADD_CAMPAIGN, DELETE_CAMPAIGN } from '../constants/actionTypes';
import objectAssign from 'object-assign';
import initialState from './../store/tempInitialState';
import Campaign from './../models/Campaign';
import { ItemsTypes } from './../constants/itemsTypes'



export default function advertiserReducer(state = initialState.account, action) {
    let newState

    const campaign = (state = {}, action) => {
        switch (action.type) {
            case DELETE_CAMPAIGN:
                let newCamp = objectAssign({},
                    state,
                    {
                        _meta: objectAssign({}, state._meta, action.meta)
                    })

                return newCamp

            case ADD_CAMPAIGN:
                return objectAssign({}, action.campaign)

            default:
                return state
        }
    }

    const campaigns = (state = [], action) => {
        if (!action.id) return state
        return [
            ...state.slice(0, action.id),
            campaign(state[action.id], action),
            ...state.slice(action.id + 1)
        ]
    }

    switch (action.type) {
        case ADD_CAMPAIGN:
            let campaign = objectAssign({}, action.campaign)
            let id = state._items[ItemsTypes.Campaign.id].length + 1

            let newCampaign = new Campaign(state._addr,
                id,
                campaign._name,
                campaign._meta.from,
                campaign._meta.to,
                campaign._meta.img,
                campaign._meta.description)

            action.id = id

            newState = {
                ...state,
                _items: {
                    ...state._items,
                    [ItemsTypes.Campaign.id]:
                    campaigns(state._items[ItemsTypes.Campaign.id],
                        { ...action, campaign: newCampaign })
                }
            }

            return newState

        case DELETE_CAMPAIGN:

            // TODO: WTF
            newState = {
                ...state,
                _items: {
                    ...state._items,
                    [ItemsTypes.Campaign.id]:
                    campaigns(state._items[ItemsTypes.Campaign.id],
                        { ...action, meta: { deleted: true } })
                }
            }

            return newState

        default:
            return state
    }
}
