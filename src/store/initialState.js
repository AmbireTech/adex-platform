import Account from 'models/Account'
import Item from 'models/Item'
import Campaign from 'models/Campaign'
import AdUnit from 'models/AdUnit'
import Channel from 'models/Channel'
import AdSlot from 'models/AdSlot'
import Bid, { BidState } from 'models/Bid'
import { ItemsTypes } from 'constants/itemsTypes'
import Helper from 'helpers/miscHelpers'
import moment from 'moment'

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

let account = null

let bidsById = [null]
let bidsByAdunit = []
let bidsByAdslot = []

function GenerateAccount() {
    if (account) return account

    let acc = new Account('Test User')
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

function generateBids(adUnits, adSlots) {
    // console.log('adUnits', adUnits)
    // console.log('adSlots', adSlots)
    for (let i = 1; i < adUnits.length; i++) {
        let unit = adUnits[i]

        for (var j = 0; j < Helper.getRandomInt(2, 10); j++) {
            let slot = adSlots[Helper.getRandomInt(1, adSlots.length - 1)]

            let bidId = bidsById.length
            let state = Helper.getRandomPropFromObj(BidState)
            let confirmedByPublisher = false
            let confirmedByAdvertiser = false
            let acceptedTime = null

            if (state === BidState.Accepted) {
                acceptedTime = Date.now()
            } else if (state === BidState.Completed) {
                confirmedByPublisher = true
                confirmedByAdvertiser = true
            }

            let bid = new Bid({
                id: bidId,
                state: Helper.getRandomInt(0, 5),
                advertiser: account,
                adUnit: unit._id,
                adUnitIpfs: unit._ipfs,
                publisher: account,
                adSlot: slot._id,
                adSlotIpfs: slot._ipfs,
                acceptedTime: acceptedTime,
                requiredPoints: Helper.getRandomInt(1, 1000),
                requiredExecTime: moment().add(Helper.getRandomInt(2, 10), 'd').valueOf(),
                confirmedByPublisher: confirmedByPublisher,
                confirmedByAdvertiser: confirmedByAdvertiser,
                publisherReportIpfs: '',
                advertiserReportIpfs: ''
            })

            bid = bid.plainObj()

            bidsById.push(bid)

            let bySlot = (bidsByAdslot[slot._id] || [])
            bySlot.push(bid.id)
            bidsByAdslot[slot._id] = bySlot // TODO: check if already have this bid

            let byUnit = (bidsByAdunit[unit._id] || [])
            byUnit.push(bid.id)
            bidsByAdunit[unit._id] = byUnit
        }
    }
}

let newCampaign = GenerateNewItem(ItemsTypes.Campaign.id, Campaign)
let newAdUnit = GenerateNewItem(ItemsTypes.AdUnit.id, AdUnit)
let newAdSlot = GenerateNewItem(ItemsTypes.AdSlot.id, AdSlot)
let newChannel = GenerateNewItem(ItemsTypes.Channel.id, Channel)
let campaigns = addItemsToItems(ItemsTypes.Campaign, Campaign, ItemsTypes.AdUnit, AdUnit)
let adUnits = GenerateItems(ItemsTypes.AdUnit, AdUnit, GenerateAccount())
let channels = addItemsToItems(ItemsTypes.Channel, Channel, ItemsTypes.AdSlot, AdSlot)
let adSlots = GenerateItems(ItemsTypes.AdSlot, AdSlot, GenerateAccount())

generateBids(adUnits, adSlots)

export default {
    account: GenerateAccount(),
    newItem: {
        [ItemsTypes.Campaign.id]: newCampaign,
        [ItemsTypes.AdUnit.id]: newAdUnit,
        [ItemsTypes.AdSlot.id]: newAdSlot,
        [ItemsTypes.Channel.id]: newChannel,
    },
    currentItem: {},
    items: {
        [ItemsTypes.Campaign.id]: campaigns,
        [ItemsTypes.AdUnit.id]: adUnits,
        [ItemsTypes.Channel.id]: channels,
        [ItemsTypes.AdSlot.id]: adSlots
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
        bidsById: bidsById,
        bidsByAdslot: bidsByAdslot,
        bidsByAdunit: bidsByAdunit
    }
}
