import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import theme from './theme.css'
import classnames from 'classnames'
import { adxToFloatView } from 'services/smart-contracts/utils'
import { web3Utils } from 'services/smart-contracts/ADX'

// TODO: make these more common

export const TabBox = ({ children }) =>
    <div className={theme.tabBox}>
        {children}
    </div>

export const TabBody = ({ children }) =>
    <div className={theme.tabBody}>
        {children}
    </div>

export const TabStickyTop = ({ children }) =>
    <div className={theme.tabStickyTop}>
        {children}
    </div>

export const TopLoading = ({ msg }) =>
    <div className={theme.tabLoading}>
        <ProgressBar className={theme.tabLoadingCircular} type='circular' mode='indeterminate' multicolor />
        <div> {msg} </div>
    </div>

export const getAddrStatsLabel = ({ stats, t }) => {
    let addrBalanceAdx = adxToFloatView(stats.balanceAdx || 0)
    let addrBalanceEth = web3Utils.fromWei(stats.balanceEth || '0', 'ether')
    let exchBal = stats.exchangeBalance || {}
    let adxOnBids = adxToFloatView(exchBal.onBids)
    let exchangeAvailable = adxToFloatView(exchBal.available)

    return t('ADDR_INFO', { args: [addrBalanceEth, addrBalanceAdx, adxOnBids, exchangeAvailable] })
}
