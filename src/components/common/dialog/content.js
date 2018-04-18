import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import theme from './theme.css'
import classnames from 'classnames'
import { AUTH_TYPES } from 'constants/misc'

export const PropRow = ({ left, right, className, classNameLeft, classNameRight }) =>
    <Row className={theme.propRow}>
        <Col xs={12} sm={4} lg={3} className={classnames(theme.leftCol, theme.uppercase, className, classNameLeft)}>{left}</Col>
        <Col xs={12} sm={8} lg={9} className={classnames(theme.rightCol, theme.breakLong, className, classNameRight)}>{right}</Col>
    </Row>

export const ContentBox = ({ children }) =>
    <div className={theme.contentBox}>
        {children}
    </div>

export const ContentBody = ({ children }) =>
    <div className={theme.contentBody}>
        {children}
    </div>

export const ContentStickyTop = ({ children }) =>
    <div className={theme.contentStickyTop}>
        {children}
    </div>

export const TopLoading = ({ msg }) =>
    <div className={theme.contentTopLoading}>
        <ProgressBar className={theme.contentTopLoadingCircular} type='circular' mode='indeterminate' multicolor />
        <div> {msg} </div>
    </div>

export const FullStepSpinner = () =>
    <ProgressBar className={theme.progressCircleCenter} type='circular' mode='indeterminate' multicolor />

export const WalletAction = ({ t, authType }) => {
    let msg = ''

    switch (authType) {
        case AUTH_TYPES.METAMASK.name:
            msg = 'METAMASK_WAITING_ACTION'
            break
        case AUTH_TYPES.TREZOR.name:
            msg = 'TREZOR_WAITING_ACTION'
            break
        case AUTH_TYPES.LEDGER.name:
            msg = 'LEDGER_WAITING_ACTION'
            break
        default:
            msg = 'WAITING_FOR_USER_ACTION'
            break
    }

    return (
        <TopLoading msg={t(msg)} />
    )
}