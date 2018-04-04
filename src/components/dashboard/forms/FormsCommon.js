import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import theme from './theme.css'
import classnames from 'classnames'
import { AUTH_TYPES } from 'constants/misc'

export const PropRow = ({ left, right, className, classNameLeft, classNameRight }) =>
    <Row >
        <Col xs={12} lg={4} className={classnames(theme.textRight, theme.capitalize, className, classNameLeft)}>{left}</Col>
        <Col xs={12} lg={8} className={classnames(theme.textLeft, theme.breakLong, className, classNameRight)}>{right}</Col>
    </Row>

export const StepBox = ({ children }) =>
    <div className={theme.stepBox}>
        {children}
    </div>

export const StepBody = ({ children }) =>
    <div className={theme.stepBody}>
        {children}
    </div>

export const StepStickyTop = ({ children }) =>
    <div className={theme.stepStickyTop}>
        {children}
    </div>

export const TopLoading = ({ msg }) =>
    <div className={theme.steptopLoading}>
        <ProgressBar className={theme.steptopLoadingCircular} type='circular' mode='indeterminate' multicolor />
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