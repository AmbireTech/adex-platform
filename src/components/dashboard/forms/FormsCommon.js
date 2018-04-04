import React from 'react'
import { Row, Col } from 'react-flexbox-grid'
import theme from './theme.css'
import classnames from 'classnames'

export const PropRow = ({ left, right, className, classNameLeft, classNameRight }) =>
    <Row >
        <Col xs={12} lg={4} className={classnames(theme.textRight, theme.capitalize, className, classNameLeft)}>{left}</Col>
        <Col xs={12} lg={8} className={classnames(theme.textLeft, theme.breakLong, className, classNameRight)}>{right}</Col>
    </Row>