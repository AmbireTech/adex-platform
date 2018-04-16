// import configureStore from 'store/configureStore'
import actions from 'actions'
import { items as ItemsConstants } from 'adex-constants'
import { getBidsBySide } from 'services/adex-node/actions'
import { Models } from 'adex-models'
const { ItemsTypes } = ItemsConstants



export const getAddrBids = ({authSig, side}) => {
    return getAdvBids({authSig})
}

export const getAdvBids = ({ authSig }) => {

    return getBidsBySide({ side: 'advertiser', authSig: authSig })
        .then((bids) => {

            actions.execute(actions.updateBids({ advBids: bids}))

            return true
        })                
}