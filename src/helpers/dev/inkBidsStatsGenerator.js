// Generate some random bids reports to use with charts until the AdEx node ready
import Bid, { BidState } from 'models/Bid'
import Helper from 'helpers/miscHelpers'
import Moment from 'moment'
import { extendMoment } from 'moment-range'
const moment = extendMoment(Moment)

const AVAILABLE_SLOTS = 2000000 // 2 000 000
const BID_STEP_SLOTS = 1000 // 1 000 (Just for the random data)
const BID_PER_SLOT_AMOUNT_STEP = 1
const MIN_BID_PER_SLOT_AMOUNT = BID_PER_SLOT_AMOUNT_STEP * 5 // 5 cents
const TOTAL_BIDS = 46
const MAX_BID_PER_SLOT_AMOUNT = MIN_BID_PER_SLOT_AMOUNT * 46 // Just for the random data

class InkBidsGenerator {
    constructor() {
        this.InkBids = this.generateSomeRandomInkBids()
    }

    generateSomeRandomInkBids() {
        let firstPoints = AVAILABLE_SLOTS
        let firstBidAmountPerSlot = MIN_BID_PER_SLOT_AMOUNT
        let totalBidAmount = firstBidAmountPerSlot * firstPoints

        let firstBid = new Bid({ id: 1, adUnitIpfs: firstBidAmountPerSlot, requiredPoints: firstPoints }).plainObj()

        let InkBids = []
        InkBids.push(firstBid)

        for (let i = InkBids.length + 1; i < TOTAL_BIDS; i++) {
            let nbAmountPerBid = Helper.getRandomInt(MIN_BID_PER_SLOT_AMOUNT, MAX_BID_PER_SLOT_AMOUNT)
            let nbSlots = (Math.floor(Helper.getRandomInt(BID_STEP_SLOTS, AVAILABLE_SLOTS + BID_STEP_SLOTS) / BID_STEP_SLOTS) * BID_STEP_SLOTS)

            let newBid = new Bid({ id: i, adUnitIpfs: nbAmountPerBid, requiredPoints: nbSlots }).plainObj()

            InkBids.push(newBid)
        }

        return InkBids
    }

    getSomeRandomBids() {
        return this.InkBids
    }
}
export default new InkBidsGenerator()
