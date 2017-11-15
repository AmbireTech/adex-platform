// Generate some random bids reports to use with charts until the AdEx node ready
import Bid, { BidState } from 'models/Bid'
import Helper from 'helpers/miscHelpers'
import Moment from 'moment'
import { extendMoment } from 'moment-range'
const moment = extendMoment(Moment)

class BidsStatsGenerator {
    constructor() {
        this.unitsStats = []
        this.slotsStats = []
        this.allBids = []
        this.acceptedBids = {}
        this.claimedBids = {}
        this.completedBids = {}
        this.activeBids = {}
        this.openedBids = {}
        this.canceledBids = {}
        this.expiredBids = {}
        this.inactiveBids = {}
        this.bidsStatesStats = {}
    }

    // We set the bids one
    setBids(bids) {
        let allBids = this.allBids = [...bids]
        let activeBids = { accepted: {}, completed: {}, claimed: {}, active: {} }
        let inactiveBids = { opened: {}, canceled: {}, expired: {}, inactive: {} }
        for (let i = 0; i < this.allBids.length; i++) {
            let bid = this.allBids[i]

            if (!bid) {
                continue
            }

            if (bid.state === BidState.Accepted) {
                activeBids.accepted[bid.id] = bid
                activeBids.active[bid.id] = bid
            } else if (bid.state === BidState.Claimed) {
                activeBids.claimed[bid.id] = bid
                activeBids.active[bid.id] = bid
            } else if (bid.state === BidState.Completed) {
                activeBids.completed[bid.id] = bid
                activeBids.active[bid.id] = bid
            } else if (bid.state === BidState.Canceled) {
                inactiveBids.canceled[bid.id] = bid
                inactiveBids.inactive[bid.id] = bid
            } else if (bid.state === BidState.Expired) {
                inactiveBids.expired[bid.id] = bid
                inactiveBids.inactive[bid.id] = bid
            } else if (bid.state === BidState.Open) {
                inactiveBids.opened[bid.id] = bid
                inactiveBids.inactive[bid.id] = bid
            }
        }

        this.acceptedBids = activeBids.accepted
        this.claimedBids = activeBids.claimed
        this.completedBids = activeBids.completed
        this.activeBids = activeBids.active
        this.canceledBids = inactiveBids.canceled
        this.expiredBids = inactiveBids.expired
        this.openedBids = inactiveBids.opened
        this.inactiveBids = inactiveBids.inactive

        this.bidsStatesStats = {
            Open: Object.keys(this.openedBids).length,
            Accepted: Object.keys(this.acceptedBids).length,
            Canceled: Object.keys(this.canceledBids).length,
            Expired: Object.keys(this.expiredBids).length,
            Completed: Object.keys(this.completedBids).length,
            Claimed: Object.keys(this.claimedBids).length
        }
    }

    getBidsDateRange(bids = []) {
        let nowStamp = moment().valueOf()
        let accepted = { start: nowStamp, end: nowStamp, totalAmount: 0, totalPoints: 0 }
        let claimed = { start: nowStamp, end: nowStamp, totalAmount: 0, totalPoints: 0 }
        let completed = { start: nowStamp, end: nowStamp, totalAmount: 0, totalPoints: 0 }

        const setRange = (range, timestamp) => {
            if (timestamp <= range.start) {
                range.start = timestamp
            } else (
                range.end = timestamp
            )
        }

        bids.map((bid, index) => {
            if (bid.state === BidState.Accepted) {
                setRange(accepted, bid.acceptedTime)
                accepted.totalAmount += bid.amount
                accepted.totalPoints += bid.requiredPoints
            } else if (bid.state === BidState.Claimed) {
                setRange(claimed, bid.acceptedTime)
                claimed.totalAmount += bid.amount
                claimed.totalPoints += bid.requiredPoints
            } else if (bid.state === BidState.Completed) {
                setRange(completed, bid.acceptedTime)
                completed.totalAmount += bid.amount
                completed.totalPoints += bid.requiredPoints
            }
        })

        return {
            accepted: accepted,
            claimed: claimed,
            completed: completed
        }
    }

    getStatsByUnit(unit, bids) {

    }

    getBidsStateStats() {
        return this.bidsStatesStats
    }

    getRandomStatsForSlots(bidsIds, zoom) {
        zoom = zoom || 'days'
        let slotActiveBids = bidsIds.reduce((memo, bidId) => {
            if (this.activeBids[bidId]) {
                memo.push(this.activeBids[bidId])
            }

            return memo
        }, [])

        let bitsDateRanges = this.getBidsDateRange(slotActiveBids)

        let completedRange = bitsDateRanges.completed

        let momentRangeCompleted = moment.range(completedRange.start, completedRange.end)
        let amount = completedRange.totalAmount
        let clicks = completedRange.totalPoints
        let days = momentRangeCompleted.length
        let rate = amount / clicks

        let dates = Array.from(momentRangeCompleted.by(zoom)).map(m => {
            let cl = Helper.getRandomInt(parseInt(clicks * 0.01), parseInt(clicks * 0.1))
            clicks -= cl
            return {
                name: m.format('MMM DD'),
                amount: cl * rate * Math.random() * 2,
                clicks: cl
            }
        })

        // console.log('momentRangeCompleted', momentRangeCompleted)
        // console.log('dates', dates)
        // console.log('ranges', bitsDateRanges)

        return dates
    }
}


export default new BidsStatsGenerator()
