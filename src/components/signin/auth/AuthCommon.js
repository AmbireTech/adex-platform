import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import { adxToFloatView } from 'services/smart-contracts/utils'
import { web3Utils } from 'services/smart-contracts/ADX'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

export const addrItem = ({ addr, stats, t, classes }) => {
    const addrBalanceAdx = adxToFloatView(stats.balanceAdx || 0)
    const addrBalanceEth = web3Utils.fromWei(stats.balanceEth || '0', 'ether')
    const exchBal = stats.exchangeBalance || {}
    const adxOnBids = adxToFloatView(exchBal.onBids || 0)
    const exchangeAvailable = adxToFloatView(exchBal.available || 0)

    return (
        <ListItemText
            primary={addr}
            secondary={
                <span className={classes.addrInfo}>
                    <span>
                        <span> ETH </span>
                        <strong> {addrBalanceEth} </strong>
                    </span>
                    <span>
                        <span> ADX </span>
                        <strong> {addrBalanceAdx} </strong>
                    </span>
                    <span>
                        <span className={classes.addrInfoLabel}> {t('ADDR_INFO_ON_BIDS')} </span>
                        <span> ADX </span>
                        <strong> {adxOnBids} </strong>
                    </span>
                    <span>
                        <span className={classes.addrInfoLabel}> {t('ADDR_INFO_XCH_AVAILABLE')} </span>
                        <span> ADX </span>
                        <strong> {exchangeAvailable}  &nbsp;</strong>
                    </span>
                </span>
            }
        />
    )
}

export const AddrItem = withStyles(styles)(addrItem)
