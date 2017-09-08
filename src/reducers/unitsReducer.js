import { ADD_UNIT, DELETE_UNIT } from '../constants/actionTypes';
import initialState from './../store/tempInitialState';
import Unit from './../models/AdUnit';

export default function unitsReducer(state = initialState.adUnits, action) {
    let newState
    let newUnit
    let newMeta

    const units = (state = [], action) => {
        if (!action.id) return state
        return [
            ...state.slice(0, action.id),
            action.unit,
            ...state.slice(action.id + 1)
        ]
    }

    switch (action.type) {
        case ADD_UNIT:
            let unit = action.unit
            let id = state.length

            //TODO: Handle account address correctly
            newUnit = new Unit(initialState.account._addr,
                id,
                unit._name,
                unit._meta.img,
                unit._meta.description)

            action.id = id

            newState = units(state, { ...action, unit: newUnit })

            return newState

        case DELETE_UNIT:
            newUnit = state[action.id].getClone()  //TODO: check for possible memory leak
            newMeta = { ...newUnit._meta }
            newMeta.deleted = true
            newUnit._meta = newMeta

            newState = units(state, { ...action, unit: newUnit })

            return newState

        default:
            return state
    }
}
