// import configureStore from 'store/configureStore'
import actions from 'actions'
import { items as ItemsConstants } from 'adex-constants'
import { getBidsBySide } from 'services/adex-node/actions'

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
            actions.execute(actions.updateBids({ [storeProp]: bids }))
            return true
        })
}