// import configureStore from 'store/configureStore'
import actions from 'actions'
import { items as ItemsConstants, exchange as ExchangeConstants } from 'adex-constants'
import { getBidsBySide } from 'services/adex-node/actions'

const { BID_STATES } = ExchangeConstants

export const sortBids = (bids) => {
    const sorted = bids.reduce((memo, bid) => {
        if (bid._state === BID_STATES.DoesNotExist.id) {
            memo.open.push(bid)
        } else if (bid._state === BID_STATES.Accepted.id
            || bid._state === BID_STATES.ConfirmedAdv.id
            || bid._state === BID_STATES.ConfirmedPub.id) {
            memo.action.push(bid)
        } else {
            memo.closed.push(bid)
        }

        return memo
    }, { action: [], open: [], closed: [] })

    return sorted
}

export const getAddrBids = ({ authSig, side }) => {

    return Promise
        .all([
            getBids({ side: 'advertiser', storeProp: 'advBids', authSig }),
            getBids({ side: 'publisher', storeProp: 'pubBids', authSig })
        ])
}

export const getBids = ({ side, storeProp, authSig }) => {
    return getBidsBySide({ side: side, authSig: authSig })
        .then((bids) => {
            const sorted = sortBids(bids)
            actions.execute(actions.updateBids({ [storeProp]: sorted }))
            return true
        })
}