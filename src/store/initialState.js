import Account from './../models/Account'
import Item from './../models/Item'
import Campaign from './../models/Campaign'
import AdUnit from './../models/AdUnit'
// import Channel from './../models/Channel'
// import Slot from './../models/AdSlot'
// import objectAssign from 'object-assign';
import { ItemsTypes } from './../constants/itemsTypes'
import Helper from './../helpers/miscHelpers'

// cached
let counts = {
    [ItemsTypes.AdUnit.id]: 0,
    [ItemsTypes.AdSlot.id]: 0,
    [ItemsTypes.Campaign.id]: 0,
    [ItemsTypes.Channel.id]: 0
}

let items = {
    [ItemsTypes.AdUnit.id]: [],
    [ItemsTypes.AdSlot.id]: [],
    [ItemsTypes.Campaign.id]: [],
    [ItemsTypes.Channel.id]: []
}

let newItems = {
    [ItemsTypes.AdUnit.id]: null,
    [ItemsTypes.AdSlot.id]: null,
    [ItemsTypes.Campaign.id]: null,
    [ItemsTypes.Channel.id]: null
}

let account = null;

function GenerateAccount() {
    if (account) return account

    let acc = new Account('Ivo Georgiev')
    return acc
}

function GenerateItems(type, itemClass, acc) {
    if (items[type.id].length) return items[type.id]
    for (let i = 1; i <= Helper.getRandomInt(69, 69); i++) {
        let id = ++counts[type.id]
        let item

        item = itemClass.getRandomInstance(acc.addr, id).plainObj()

        items[type.id][item._id] = item
        acc.addItem(item)
    }

    return items[type.id]
}

function addUnitsToCampaigns() {
    if (items[ItemsTypes.Campaign.id].length) return items[ItemsTypes.Campaign.id]

    let campaigns = GenerateItems(ItemsTypes.Campaign, Campaign, GenerateAccount())
    let adUnits = GenerateItems(ItemsTypes.AdUnit, AdUnit, GenerateAccount())

    for (let i = 1; i < campaigns.length; i++) {
        let used = []

        for (let j = 1; j < Helper.getRandomInt(1, adUnits.length); j++) {
            if (used.indexOf(adUnits[j]) > -1) continue

            campaigns[i]._meta.items.push(adUnits[j]._id) // = Item.addItem(campaigns[i], adUnits[j])
            used.push(adUnits[j])
        }
    }

    items[ItemsTypes.Campaign.id] = campaigns

    return items[ItemsTypes.Campaign.id]
}

function GenerateNewItem(itemType, itemClass) {
    if (newItems[itemType]) return newItems[itemType]

    let newItem = new itemClass(GenerateAccount().addr, '', '', {}).plainObj()
    newItem.item_type = itemClass
    newItems[itemType] = newItem
    return newItem
}

export default {
    account: GenerateAccount(),
    newItem: {
        [ItemsTypes.Campaign.id]: GenerateNewItem(ItemsTypes.Campaign.id, Campaign),
        [ItemsTypes.AdUnit.id]: GenerateNewItem(ItemsTypes.AdUnit.id, AdUnit),
    },
    currentItem: {},
    items: {
        [ItemsTypes.Campaign.id]: addUnitsToCampaigns(),
        [ItemsTypes.AdUnit.id]: GenerateItems(ItemsTypes.AdUnit, AdUnit, GenerateAccount())
    },
    spinners: {},
    ui: {},
    toasts: [],
    confirm: {
        data: {}
    },
    nav: {
        side: ''
    }
}
