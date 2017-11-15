import DevInitialStateGenerator from 'helpers/dev/initialStateGenerator'
import { ItemsTypes } from 'constants/itemsTypes'

// TODO: fix the initial state
let initialState = DevInitialStateGenerator.getDevInitialState()

if (process.env.NODE_ENV === 'production') {
    initialState.items = {
        [ItemsTypes.Campaign.id]: [],
        [ItemsTypes.AdUnit.id]: [],
        [ItemsTypes.Channel.id]: [],
        [ItemsTypes.AdSlot.id]: []
    }

    initialState.bids = {
        bidsById: [],
        bidsIds: [],
        bidsByAdslot: [],
        bidsByAdunit: []
    }
}

export default initialState
