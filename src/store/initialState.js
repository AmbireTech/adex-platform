import DevInitialStateGenerator from 'helpers/dev/initialStateGenerator'
import { ItemsTypes } from 'constants/itemsTypes'
import Campaign from 'models/Campaign'
import AdUnit from 'models/AdUnit'
import Channel from 'models/Channel'
import AdSlot from 'models/AdSlot'

let initialState = {
    account: {
        account: this.account,
    },
    signin: {
        name: '',
        email: '',
        password: '',
        passConfirm: '',
        seed: '',
        publicKey: '',
        seedCheck: [],
        authenticated: false
    },
    newItem: {
        [ItemsTypes.Campaign.id]: new Campaign().plainObj(),
        [ItemsTypes.AdUnit.id]: new AdUnit().plainObj(),
        [ItemsTypes.AdSlot.id]: new AdSlot().plainObj(),
        [ItemsTypes.Channel.id]: new Channel().plainObj(),
    },
    currentItem: {},
    items: {
        [ItemsTypes.Campaign.id]: [],
        [ItemsTypes.AdUnit.id]: [],
        [ItemsTypes.Channel.id]: [],
        [ItemsTypes.AdSlot.id]: []
    },
    spinners: {},
    ui: {},
    toasts: [],
    confirm: {
        data: {}
    },
    nav: {
        side: ''
    },
    language: 'en-US',
    validations: {},
    bids: {
        bidsById: [],
        bidsIds: [],
        bidsByAdslot: [],
        bidsByAdunit: []
    }
}

if (process.env.NODE_ENV === 'development') {
    // TODO: fix the initial state
    // initialState = DevInitialStateGenerator.getDevInitialState()
}

export default initialState
