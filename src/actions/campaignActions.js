import * as types from '../constants/actionTypes'

export function addCampaign(campaign) {
    return function (dispatch) {
        return dispatch({
            type: types.ADD_CAMPAIGN,
            campaign: campaign
        })        
    }
}
