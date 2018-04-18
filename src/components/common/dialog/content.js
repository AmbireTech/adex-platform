import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import theme from './theme.css'
import classnames from 'classnames'

export const PropRow = ({ left, right, className, classNameLeft, classNameRight }) =>
    <Row className={theme.propRow}>
        <Col xs={12} sm={4} lg={3} className={classnames(theme.leftCol, theme.uppercase, className, classNameLeft)}>{left}</Col>
        <Col xs={12} sm={8} lg={9} className={classnames(theme.rightCol, theme.breakLong, className, classNameRight)}>{right}</Col>
    </Row>

export const ContentBox = ({ children, className }) =>
    <div className={classnames(theme.contentBox, className)}>
        {children}
    </div>

export const ContentBody = ({ children, className }) =>
    <div className={classnames(theme.contentBody, className)}>
        {children}
    </div>

export const ContentStickyTop = ({ children, className }) =>
    <div className={classnames(theme.contentStickyTop)}>
        {children}
    </div>

export const TopLoading = ({ msg, className }) =>
    <div className={classnames(theme.contentTopLoading)}>
        <ProgressBar className={theme.contentTopLoadingCircular} type='circular' mode='indeterminate' multicolor />
        <div> {msg} </div>
    </div>

export const FullContentSpinner = () =>
    <ProgressBar className={classnames(theme.progressCircleCenter)} type='circular' mode='indeterminate' multicolor />