import Account from './../models/Account'
import Campaign from './../models/Campaign'
import AdUnit from './../models/AdUnit'
// import Channel from './../models/Channel'
// import Slot from './../models/AdSlot'
// import objectAssign from 'object-assign';
// import itemsHelpers from './../helpers/itemsHelpers'
import {ItemsTypes} from './../constants/itemsTypes'
import Helper from './../helpers/miscHelpers'

// cached
let counts = {
    0: 0,
    1: 0,
    2: 0,
    3: 0
}

let items = {
    0: [],
    1: [],
    2: [],
    3: []
}

let account = null;
let campaign = null;
let unit = null;
// let channel = null;
// let slot = null;

function GenerateAccount() {
    if (account) return account

    let acc = new Account('Ivo Georgiev')
    return acc
}

function GenerateItems(type, acc) {
    if(items[type.id].length) return items[type.id]
    for (let i = 1; i <= Helper.getRandomInt(5, 20); i++) {
        let id = ++counts[type.id]
        let item

        switch (type.id) {
            case ItemsTypes.Campaign.id:
                item = Campaign.getRandCampaignInst(acc.addr, id)
                break
            case ItemsTypes.AdUnit.id:
                item = AdUnit.getRandAdUnitInst(acc.addr, id)
                break
            default:
                continue
        }

        items[type.id][item._id] = item
        acc.addItem(item)
    }

    return items[type.id]
}

function GenerateCampaign() {
    if (campaign) return campaign
    let camp = new Campaign(GenerateAccount()._id, '', null, null, '', '')
    return camp
}

function GenerateUnit() {
    if (unit) return unit
    let unt = new AdUnit(GenerateAccount()._id, '', '', '', '', '', '', '')
    return unt
}

export default {
    account: GenerateAccount(),
    newItem: {
        campaign: GenerateCampaign(),
        unit: GenerateUnit(),
    },
    campaigns: GenerateItems(ItemsTypes.Campaign, GenerateAccount()),
    adUnits: GenerateItems(ItemsTypes.AdUnit, GenerateAccount())
}
