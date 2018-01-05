import Helper from 'helpers/miscHelpers'

export const BidState = {
    Open: 0,
    Accepted: 1,
    Canceled: 2,
    Expired: 3,
    Completed: 4,
    Claimed: 5
}

export const BidStateNames = (() => {
    return Object.keys(BidState).reduce((memo, state) => {
        memo[BidState[state]] = state
        return memo
    }, {})
})()

// TODO: extend Base?
class Bid {
    constructor({
        id = null,
        state = BidState.Open,
        amount = 0,
        advertiser = null,
        advertiserWallet = null,
        adUnit = null,
        adUnitIpfs = null,
        advertiserPeer = null,
        publisher = null,
        publisherWallet = null,
        adSlot = null,
        adSlotIpfs = null,
        publisherPeer = null,
        acceptedTime = null,
        requiredPoints = null,
        requiredExecTime = null,
        confirmedByPublisher = false,
        confirmedByAdvertiser = false,
        publisherReportIpfs = null,
        advertiserReportIpfs = null,
        txTime = null // TODO: Maybe prop name dateOpened || createdOn here
    } = {}) {
        // TODO: validate types!!!
        this.id = id
        this.state = state
        this.amount = parseInt(amount)
        this.advertiser = parseInt(advertiser)
        this.advertiserWallet = advertiserWallet
        this.adUnit = adUnit
        this.adUnitIpfs = parseInt(adUnitIpfs)
        this.advertiserPeer = parseInt(advertiserPeer)
        this.publisher = publisher
        this.publisherWallet = publisherWallet
        this.adSlot = parseInt(adSlot)
        this.adSlotIpfs = parseInt(adSlotIpfs)
        this.publisherPeer = publisherPeer
        this.acceptedTime = acceptedTime
        this.requiredPoints = parseInt(requiredPoints)
        this.requiredExecTime = requiredExecTime
        this.confirmedByPublisher = confirmedByPublisher
        this.confirmedByAdvertiser = confirmedByAdvertiser
        this.publisherReportIpfs = publisherReportIpfs
        this.advertiserReportIpfs = advertiserReportIpfs
        this.txTime = txTime

        return this
    }

    plainObj() {
        return { ...this }
    }

    static updateBid(bid, key, value, dirtyProps) {
        // TODO: handle prop types
        let newBid = { ...bid }
        let hasDirtyProps = Array.isArray(dirtyProps)
        if (hasDirtyProps) dirtyProps = [...dirtyProps]
        // TODO: Validate bid props
        if (newBid.hasOwnProperty(key)) {
            newBid[key] = value

            if (hasDirtyProps && dirtyProps.indexOf(key) < 0) {
                dirtyProps.push(key)
            }
        }

        return newBid
    }
}

export default Bid
