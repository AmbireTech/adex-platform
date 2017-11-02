import Helper from 'helpers/miscHelpers'

export const BidState = {
    Open: 0,
    Accepted: 1,
    Canceled: 2,
    Expired: 3,
    Completed: 4,
    Claimed: 5
}

class Bid {
    constructor({
        id = null,
        state = BidState.Open,
        amount = 0,
        advertiser = null,
        advertiserWallet = null,
        adUnit = null,
        adUnitIpfs = '',
        publisher = null,
        publisherWallet = null,
        adSlot = null,
        adSlotIpfs = '',
        publisherPeer = '',
        acceptedTime = null,
        requiredPoints = null,
        requiredExecTime = null,
        confirmedByPublisher = false,
        confirmedByAdvertiser = false,
        publisherReportIpfs = '',
        advertiserReportIpfs = '',
        txTime = null // TODO: Maybe prop name dateOpened || createdOn here
    }) {
        this.id = id
        this.state = state
        this.amount = amount
        this.advertiser = advertiser
        this.advertiserWallet = advertiserWallet
        this.adUnit = adUnit
        this.adUnitIpfs = adUnitIpfs
        this.publisher = publisher
        this.publisherWallet = publisherWallet
        this.adSlot = adSlot
        this.adSlotIpfs = adSlotIpfs
        this.publisherPeer = publisherPeer
        this.acceptedTime = acceptedTime
        this.requiredPoints = requiredPoints
        this.requiredExecTime = requiredExecTime
        this.confirmedByPublisher = confirmedByPublisher
        this.confirmedByAdvertiser = confirmedByAdvertiser
        this.publisherReportIpfs = publisherReportIpfs
        this.advertiserReportIpfs = advertiserReportIpfs
        this.txTime = txTime
    }

    plainObj() {
        return { ...this }
    }

    static updateBid(bid, propKey, value) {
        let newBid = { ...bid }
        // TODO: Validate bid props
        if (newBid.hasOwnProperty(propKey)) {
            newBid[propKey] = value
        }

        return newBid
    }
}

export default Bid
