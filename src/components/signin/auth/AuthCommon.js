import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import ProgressBar from 'react-toolbox/lib/progress_bar'
import theme from './theme.css'
import classnames from 'classnames'

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
