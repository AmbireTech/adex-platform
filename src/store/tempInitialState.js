import Account from './../models/Account'
import Campaign from './../models/Campaign'
import Unit from './../models/AdUnit'
// import Channel from './../models/Channel'
// import Slot from './../models/AdSlot'
import objectAssign from 'object-assign';

// cached
let account = null;
let campaign = null;
let unit = null;
let channel = null;
let slot = null;

function GenerateAccount() {
    if(account) return account

    let acc = new Account('John Smith')
    acc.fillAccountWithRandItems()
    let clean = objectAssign({}, acc)
    let cleanItems = [...clean._items]
    clean._items = cleanItems

    account = clean
    return clean
}

function GenerateCampaign() {
    if(campaign) return campaign

    let camp = new Campaign(GenerateAccount()._id, '', null, null, '', '' )
    let clean = objectAssign({}, camp)
    campaign = clean
    return clean
}

function GenerateUnit() {
    if(unit) return unit

    let unt = new Unit(GenerateAccount()._id, '', '', '', '', '', '', '')
    let clean = objectAssign({}, unt)
    campaign = clean
    return clean
}

export default {
    account: GenerateAccount(),
    newItem: {
        campaign: GenerateCampaign(),
        unit: GenerateUnit()
    }
}
