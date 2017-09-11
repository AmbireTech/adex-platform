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
    console.log('deleteCampaign', campaign)
    return function (dispatch) {
        return dispatch({
        // return {
            type: types.DELETE_CAMPAIGN,
            id: campaign
        // }
        })        
    }
}

export function removeUnitFromCampaign(campaign, unit) {
    return function (dispatch) {
        return dispatch({
        // return {
            type: types.REMOVE_UNIT_FROM_CAMPAIGN,
            campaign: campaign,
            unit: unit,
        // }
        })        
    }
}
