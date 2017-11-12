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
import BidsStatsGenerator from 'helpers/dev/bidsStatsGenerator'

class InitialStateGenerator {
    constructor() {
        this.counts = {
            [ItemsTypes.AdUnit.id]: 0,
            [ItemsTypes.AdSlot.id]: 0,
            [ItemsTypes.Campaign.id]: 0,
            [ItemsTypes.Channel.id]: 0
        }

        this.items = {
            [ItemsTypes.AdUnit.id]: [],
            [ItemsTypes.AdSlot.id]: [],
            [ItemsTypes.Campaign.id]: [],
            [ItemsTypes.Channel.id]: []
        }

        this.newItems = {
            [ItemsTypes.AdUnit.id]: null,
            [ItemsTypes.AdSlot.id]: null,
            [ItemsTypes.Campaign.id]: null,
            [ItemsTypes.Channel.id]: null
        }

        this.account = null

        this.bidsById = [null]
        this.bidsIds = [null]
        this.bidsByAdunit = []
        this.bidsByAdslot = []
        this.bidsByAdunitObjs = []
        this.bidsByAdslotObjs = []
    }

    GenerateAccount() {
        if (this.account) return this.account

        let acc = new Account('Test User')
        this.account = acc
        return acc
    }

    GenerateItems(type, itemClass, acc) {
        if (this.items[type.id].length) return this.items[type.id]
        for (let i = 1; i <= Helper.getRandomInt(46, 46); i++) {
            let id = ++this.counts[type.id]
            let item

            item = itemClass.getRandomInstance(acc.addr, id).plainObj()

            this.items[type.id][item._id] = item
            acc.addItem(item)
        }

        return this.items[type.id]
    }

    addItemsToItems(collectionType, collectionClass, itemType, itemClass) {
        if (this.items[collectionType.id].length) return this.items[collectionType.id]

        let collection = this.GenerateItems(collectionType, collectionClass, this.GenerateAccount())
        let collectionItems = this.GenerateItems(itemType, itemClass, this.GenerateAccount())

        for (let i = 1; i < collection.length; i++) {
            let used = []

            for (let j = 1; j < Helper.getRandomInt(1, collectionItems.length); j++) {
                if (used.indexOf(collectionItems[j]) > -1) continue

                collection[i]._meta.items.push(collectionItems[j]._id) // = Item.addItem(campaigns[i], adUnits[j])
                used.push(collectionItems[j])
            }
        }

        this.items[collectionType.id] = collection

        return this.items[collectionType.id]
    }

    GenerateNewItem(itemType, itemClass) {
        if (this.newItems[itemType]) return this.newItems[itemType]

        let newItem = new itemClass({ owner: this.GenerateAccount().addr }).plainObj()
        newItem.item_type = itemClass
        this.newItems[itemType] = newItem
        return newItem
    }

    generateBids(adUnits, adSlots) {
        // console.log('adUnits', adUnits)
        // console.log('adSlots', adSlots)
        for (let i = 1; i < adUnits.length; i++) {
            let unit = adUnits[i]
            let unitTxTime = moment(unit._meta.createdOn)

            for (var j = 1; j < Helper.getRandomInt(50, 200); j++) {
                let slot = adSlots[Helper.getRandomInt(1, adSlots.length - 1)]
                let slotTxTime = moment(slot._meta.createdOn)

                let bidId = this.bidsById.length
                let state = Helper.getRandomPropFromObj(BidState)
                let confirmedByPublisher = false
                let confirmedByAdvertiser = false
                let txTime = null
                let acceptedTime = null
                let expireTime = null

                if (unitTxTime.isBefore(slotTxTime)) {
                    txTime = Helper.geRandomMoment(0, 60, slotTxTime)
                } else {
                    txTime = Helper.geRandomMoment(0, 60, unitTxTime)
                }

                if (state === BidState.Accepted || state === BidState.Claimed || state === BidState.Completed) {
                    acceptedTime = Helper.geRandomMoment(0, 30, txTime)

                    if (state === BidState.Completed) {
                        confirmedByPublisher = true
                        confirmedByAdvertiser = true
                    }
                }

                expireTime = Helper.geRandomMoment(0, 30, acceptedTime || txTime)

                let amount = Helper.getRandomInt(0, 1000)

                let bid = new Bid({
                    id: bidId,
                    state: state,
                    amount: amount,
                    advertiser: this.account._meta.fullName,
                    adUnit: unit._id,
                    adUnitIpfs: unit._ipfs,
                    publisher: this.account,
                    adSlot: slot._id,
                    adSlotIpfs: slot._ipfs,
                    acceptedTime: acceptedTime ? acceptedTime.valueOf() : acceptedTime,
                    requiredPoints: amount * Helper.getRandomInt(100, 200),
                    requiredExecTime: expireTime ? expireTime.valueOf() : expireTime,
                    confirmedByPublisher: confirmedByPublisher,
                    confirmedByAdvertiser: confirmedByAdvertiser,
                    publisherReportIpfs: '',
                    advertiserReportIpfs: '',
                    txTime: txTime ? txTime.valueOf() : txTime
                })

                let plainBid = bid.plainObj()

                this.bidsById.push(plainBid)
                this.bidsIds.push(bidId)

                let bySlot = (this.bidsByAdslot[slot._id] || [])
                bySlot.push(plainBid.id)
                this.bidsByAdslot[slot._id] = bySlot // TODO: check if already have this bid
                this.bidsByAdslotObjs[slot] = bySlot

                let byUnit = (this.bidsByAdunit[unit._id] || [])
                byUnit.push(plainBid.id)
                this.bidsByAdunit[unit._id] = byUnit
                this.bidsByAdunitObjs[unit] = byUnit
            }
        }
    }

    getDevInitialState() {
        let newCampaign = this.GenerateNewItem(ItemsTypes.Campaign.id, Campaign)
        let newAdUnit = this.GenerateNewItem(ItemsTypes.AdUnit.id, AdUnit)
        let newAdSlot = this.GenerateNewItem(ItemsTypes.AdSlot.id, AdSlot)
        let newChannel = this.GenerateNewItem(ItemsTypes.Channel.id, Channel)
        let campaigns = this.addItemsToItems(ItemsTypes.Campaign, Campaign, ItemsTypes.AdUnit, AdUnit)
        let adUnits = this.GenerateItems(ItemsTypes.AdUnit, AdUnit, this.GenerateAccount())
        let channels = this.addItemsToItems(ItemsTypes.Channel, Channel, ItemsTypes.AdSlot, AdSlot)
        let adSlots = this.GenerateItems(ItemsTypes.AdSlot, AdSlot, this.GenerateAccount())

        this.generateBids(adUnits, adSlots)

        let bidsGenerator = BidsStatsGenerator
        bidsGenerator.setBids(this.bidsById)
        // bidsGenerator.getRandomStatsForSlot(5, bidsByAdslot[5])

        return {
            account: this.account,
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
                bidsById: this.bidsById,
                bidsIds: this.bidsIds,
                bidsByAdslot: this.bidsByAdslot,
                bidsByAdunit: this.bidsByAdunit
            }
        }
    }
}

export default new InitialStateGenerator()
