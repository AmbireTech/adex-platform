import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import theme from './theme.css'
import classnames from 'classnames'
import { adxToFloatView } from 'services/smart-contracts/utils'
import { web3Utils } from 'services/smart-contracts/ADX'

export const AddrItem = ({ addr, stats, t }) => {
    let addrBalanceAdx = adxToFloatView(stats.balanceAdx || 0)
    let addrBalanceEth = web3Utils.fromWei(stats.balanceEth || '0', 'ether')
    let exchBal = stats.exchangeBalance || {}
    let adxOnBids = adxToFloatView(exchBal.onBids || 0)
    let exchangeAvailable = adxToFloatView(exchBal.available || 0)

    return (
        <div className={theme.addrInfoWrapper}>
            <div className={theme.addr}>
                {addr}
            </div>
            <div className={theme.addrInfo}>
                <span>
                    <span> ETH </span>
                    <strong> {addrBalanceEth} </strong>
                </span>
                <span>
                    <span> ADX </span>
                    <strong> {addrBalanceAdx} </strong>
                </span>
                <span>
                    <span className={theme.addrInfoLabel}> {t('ADDR_INFO_ON_BIDS')} </span>
                    <span> ADX </span>
                    <strong> {adxOnBids} </strong>
                </span>
                <span>
                    <span className={theme.addrInfoLabel}> {t('ADDR_INFO_XCH_AVAILABLE')} </span>
                    <span> ADX </span>
                    <strong> {exchangeAvailable}  &nbsp;</strong>
                </span>
            </div>
        </div>
    )
}
