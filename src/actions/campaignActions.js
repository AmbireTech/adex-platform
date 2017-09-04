import * as types from '../constants/actionTypes'

export function addCampaign(campaign) {
    return function (dispatch) {
        return dispatch({
            type: types.ADD_CAMPAIGN,
            campaign: campaign
        })        
    }
}

export function deleteCampaign(campaign) {
    console.log('campaign', campaign)
    return function (dispatch) {
        return dispatch({
        // return {
            type: types.DELETE_CAMPAIGN,
            id: campaign
        // }
        })        
    }
}
