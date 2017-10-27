import Account from 'models/Account'
import Item from 'models/Item'
import Campaign from 'models/Campaign'
import AdUnit from 'models/AdUnit'
import Channel from 'models/Channel'
import AdSlot from 'models/AdSlot'
import { ItemsTypes } from 'constants/itemsTypes'
import Helper from 'helpers/miscHelpers'

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
    for (let i = 1; i <= Helper.getRandomInt(46, 46); i++) {
        let id = ++counts[type.id]
        let item

        item = itemClass.getRandomInstance(acc.addr, id).plainObj()

        items[type.id][item._id] = item
        acc.addItem(item)
    }

    return items[type.id]
}

function addItemsToItems(collectionType, collectionClass, itemType, itemClass) {
    console.log('collectionType', collectionType)
    console.log('collectionClass', collectionClass)
    console.log('itemType', itemType)
    console.log('itemClass', itemClass)
    if (items[collectionType.id].length) return items[collectionType.id]

    let collection = GenerateItems(collectionType, collectionClass, GenerateAccount())
    let collectionItems = GenerateItems(itemType, itemClass, GenerateAccount())

    for (let i = 1; i < collection.length; i++) {
        let used = []

        for (let j = 1; j < Helper.getRandomInt(1, collectionItems.length); j++) {
            if (used.indexOf(collectionItems[j]) > -1) continue

            collection[i]._meta.items.push(collectionItems[j]._id) // = Item.addItem(campaigns[i], adUnits[j])
            used.push(collectionItems[j])
        }
    }

    items[collectionType.id] = collection

    return items[collectionType.id]
}

function GenerateNewItem(itemType, itemClass) {
    if (newItems[itemType]) return newItems[itemType]

    let newItem = new itemClass({ owner: GenerateAccount().addr }).plainObj()
    newItem.item_type = itemClass
    newItems[itemType] = newItem
    return newItem
}

export default {
    account: GenerateAccount(),
    newItem: {
        [ItemsTypes.Campaign.id]: GenerateNewItem(ItemsTypes.Campaign.id, Campaign),
        [ItemsTypes.AdUnit.id]: GenerateNewItem(ItemsTypes.AdUnit.id, AdUnit),
        [ItemsTypes.AdSlot.id]: GenerateNewItem(ItemsTypes.AdSlot.id, AdSlot),
        [ItemsTypes.Channel.id]: GenerateNewItem(ItemsTypes.Channel.id, Channel),
    },
    currentItem: {},
    items: {
        [ItemsTypes.Campaign.id]: addItemsToItems(ItemsTypes.Campaign, Campaign, ItemsTypes.AdUnit, AdUnit),
        [ItemsTypes.AdUnit.id]: GenerateItems(ItemsTypes.AdUnit, AdUnit, GenerateAccount()),
        [ItemsTypes.Channel.id]: addItemsToItems(ItemsTypes.Channel, Channel, ItemsTypes.AdSlot, AdSlot),
        [ItemsTypes.AdSlot.id]: GenerateItems(ItemsTypes.AdSlot, AdSlot, GenerateAccount())
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
    validations: {}
}
