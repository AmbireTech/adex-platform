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
        advertiser = null, //address
        adUnit = null,//bytes32 (ipfs hash or node id)
        publisher = null, //address
        adSlot = null,//bytes32
        acceptedTime = null,//uint
        amount = 0,//uint
        target = 0,//uint
        timeout = 0,//uint
        publisherConfirmation = false,//bytes32
        advertiserConfirmation = false,//bytes32
    } = {}) {
        // TODO: validate types!!!
        this.id = id
        this.state = state
        this.amount = parseInt(amount)
        this.advertiser = parseInt(advertiser)
        this.adUnit = adUnit
        this.publisher = publisher
        this.adSlot = parseInt(adSlot)
        this.acceptedTime = acceptedTime
        this.target = parseInt(target)
        this.timeout = timeout
        this.publisherConfirmation = publisherConfirmation
        this.advertiserConfirmation = advertiserConfirmation
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
