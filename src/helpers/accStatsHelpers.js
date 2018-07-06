import { web3Utils } from 'services/smart-contracts/ADX'
import { adxToFloatView } from 'services/smart-contracts/utils'

export const getStatsValues = (stats = {}) => {
    const addrBalanceAdx = adxToFloatView(stats.balanceAdx || 0)
    const addrBalanceEth = web3Utils.fromWei(stats.balanceEth || '0', 'ether')
    const exchBal = stats.exchangeBalance || {}
    // let adxOnExchangeTotal = adxToFloatView(exchBal.total)
    const adxOnBids = adxToFloatView(exchBal.onBids || 0)
    const exchangeAvailable = adxToFloatView(exchBal.available || 0)

    return {
        addrBalanceAdx,
        addrBalanceEth,
        adxOnBids,
        exchangeAvailable
    }
}