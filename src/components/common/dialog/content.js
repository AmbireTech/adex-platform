import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
// import ProgressBar from 'react-toolbox/lib/progress_bar'
import Grid from '@material-ui/core/Grid'
import CircularProgress from '@material-ui/core/CircularProgress'
import { styles } from './theme.js'
import classnames from 'classnames'
import { withStyles } from '@material-ui/core/styles'

const propRow = ({ classes, left, right, className, classNameLeft, classNameRight, style = {} }) =>
    <Grid item spacing={16} container xs={12} className={classnames(className)} style={style}>
        <Grid item xs={12} sm={4} lg={3} className={classnames(classes.leftCol, classes.uppercase, classNameLeft)}>{left}</Grid >
        <Grid item xs={12} sm={8} lg={9} className={classnames(classes.rightCol, classes.breakLong, classNameRight)}>{right}</Grid >
    </Grid>

const contentBox = ({ classes, children, className }) =>
    <div className={classnames(classes.contentBox, className)}>
        {children}
    </div>

const contentBody = ({ classes, children, className }) =>
    <div className={classnames(classes.contentBody, className)}>
        {children}
    </div>

const contentStickyTop = ({ classes, children, className }) =>
    <div className={classnames(classes.contentStickyTop)}>
        {children}
    </div>

const topLoading = ({ classes, msg, className }) =>
    <div className={classnames(classes.contentTopLoading)}>
        <CircularProgress className={classes.contentTopLoadingCircular} size={50} />
        <div> {msg} </div>
    </div>

const fullContentSpinner = ({ classes }) =>
    <CircularProgress className={classnames(classes.progressCircleCenter)} size={50} />

export const PropRow = withStyles(styles)(propRow)
export const ContentBox = withStyles(styles)(contentBox)
export const ContentBody = withStyles(styles)(contentBody)
export const ContentStickyTop = withStyles(styles)(contentStickyTop)
export const TopLoading = withStyles(styles)(topLoading)
export const FullContentSpinner = withStyles(styles)(fullContentSpinner)