import * as types from '../constants/actionTypes'

export function addCampaign(campaign) {
    return function (dispatch) {
        return dispatch({
            type: types.ADD_CAMPAIGN,
            campaign: campaign
        })        
    }
}

export function updateNewCampaign(campaign) {
    return function (dispatch) {
        return dispatch({
            type: types.UPDATE_NEW_CAMPAIGN,
            campaign: campaign
        })        
    }
}

export function resetNewCampaign() {
    return function (dispatch) {
        return dispatch({
            type: types.RESET_NEW_CAMPAIGN
        })        
    }
}

export function deleteCampaign(campaign) {
    return function (dispatch) {
        return dispatch({
        // return {
            type: types.DELETE_CAMPAIGN,
            id: campaign
        // }
        })        
    }
}
