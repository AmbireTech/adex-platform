// Generate some random bids reports to use with charts until the AdEx node ready
import Bid, { BidState } from 'models/Bid'
import Helper from 'helpers/miscHelpers'
import Moment from 'moment'
import { extendMoment } from 'moment-range'
const moment = extendMoment(Moment)

const TOTAL_AVAIALBLE_SLOTS = 2000000
const TOTAL_BIDS = 46

// adUnitIpfs - amount in USD / 100
class InkBidsGenerator {
    constructor() {
        this.InkBits = []
    }

    generateSomeRandomInkBids() {

        let firstPoints = TOTAL_AVAIALBLE_SLOTS
        let totalBidAmount = 5 * firstPoints
        let bidPerPoint = totalBidAmount / TOTAL_AVAIALBLE_SLOTS


        let firstBid = new Bid({ id: 1, adUnitIpfs: bidPerPoint, requiredPoints: firstPoints }).plainObj()

        this.InkBits.push(firstBid)

        for (let i = this.InkBits.length; i < TOTAL_BIDS; i++) {
            let lastBid = this.InkBits[i]

            let newBid = new Bid()
        }
    }
}


export default new InkBidsGenerator()
