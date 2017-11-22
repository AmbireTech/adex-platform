// Generate some random bids reports to use with charts until the AdEx node ready
import Bid, { BidState } from 'models/Bid'
import Helper from 'helpers/miscHelpers'
import Moment from 'moment'
import { extendMoment } from 'moment-range'
const moment = extendMoment(Moment)

const AVAILABLE_SLOTS = 2000000 // 2 000 000
const BID_STEP_SLOTS = 10000 // 10 000 (Just for the random data)
const BID_PER_SLOT_AMOUNT_STEP = 1
const MIN_BID_PER_SLOT_AMOUNT = BID_PER_SLOT_AMOUNT_STEP * 5 // 5 cents
const TOTAL_BIDS = 10
const MAX_BID_PER_SLOT_AMOUNT = MIN_BID_PER_SLOT_AMOUNT * 20 // Just for the random data

class AuctionBidsGenerator {
    constructor() {
        this.auctionBids = this.generateSomeRandomAuctionBids()
    }

    generateSomeRandomAuctionBids() {
        let firstPoints = AVAILABLE_SLOTS
        let firstBidAmountPerSlot = MIN_BID_PER_SLOT_AMOUNT
        let totalBidAmount = firstBidAmountPerSlot * firstPoints

        let firstBid = new Bid({ id: 1, advertiserPeer: firstBidAmountPerSlot, requiredPoints: firstPoints }).plainObj()

        let auctionBids = []
        auctionBids.push(firstBid)

        for (let i = auctionBids.length + 1; i < TOTAL_BIDS; i++) {
            let nbAmountPerBid = Helper.getRandomInt(MIN_BID_PER_SLOT_AMOUNT, MAX_BID_PER_SLOT_AMOUNT)
            let nbSlots = (Math.floor(Helper.getRandomInt(BID_STEP_SLOTS, AVAILABLE_SLOTS + BID_STEP_SLOTS) / BID_STEP_SLOTS) * BID_STEP_SLOTS)

            let newBid = new Bid({ id: i, advertiserPeer: nbAmountPerBid, requiredPoints: nbSlots }).plainObj()

            auctionBids.push(newBid)
        }

        return auctionBids
    }

    getSomeRandomBids() {
        return this.auctionBids
    }
}
export default new AuctionBidsGenerator()
