import React, { Component } from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Card, CardMedia, CardTitle, CardActions } from 'react-toolbox/lib/card'
import Input from 'react-toolbox/lib/input'
import Img from 'components/common/img/Img'
import theme from './../theme.css'
import { items as ItemsConstants } from 'adex-constants'
import { Item } from 'adex-models'
import UnitTargets from 'components/dashboard/containers/UnitTargets'
import { adxToFloatView } from 'services/smart-contracts/utils'
import moment from 'moment'

const { ItemsTypes, AdTypes, AdSizes, AdSizesByValue, AdTypesByValue } = ItemsConstants

export const PropRow = ({ left, right }) =>
    <Row >
        <Col xs={12} lg={4} className={theme.textRight}>{left}:</Col>
        <Col xs={12} lg={8} className={theme.textLeft}>{right}</Col>
    </Row>

export const AdUnit = ({ unit = {}, unitMeta = {}, t }) =>
    <div>
        <PropRow left={t('UNIT_NAME')} right={unitMeta.fullName} />
        <PropRow left={t('UNIT_URL')}
            right={<a target='_blank' href={unitMeta.ad_url} > {unitMeta.ad_url} </a>}
        />
        <PropRow left={t('UNIT_BANNER')}
            right={<Img className={theme.imgPreview} src={Item.getImgUrl(unitMeta.img.ipfs, process.env.IPFS_GATEWAY)} alt={unitMeta.fullName} />}
        />
        <PropRow left={t('UNIT_IPFS')}
            right={<a target='_blank' href={process.env.IPFS_GATEWAY + unit._ipfs} > {unit._ipfs} </a>}
        />
        <PropRow left={t('PUBLISHER')}
            right={<a target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + unitMeta.owner} > {unitMeta.owner} </a>}
        />
        <PropRow left={t('UNIT_TARGETS')}
            right={<UnitTargets targets={unitMeta.targets} t={t} />}
        />
    </div>

export const BidInfo = ({ bid, slot, unit, t, rightComponent, ...rest }) => {

    const accepted = (bid._acceptedTime || 0) * 1000
    const timeout = (bid._timeout || 0) * 1000
    const bidExpires = accepted ? (accepted + timeout) : null

    return (
        <div className={theme.itemPropTop}>
            <Grid fluid style={{ padding: 0 }}>
                <PropRow left={t('BID_TARGET')} right={bid._target} />
                <PropRow left={t('BID_AMOUNT')} right={adxToFloatView(bid._amount) + ' ADX'} />
                <PropRow left={t('UNIT_TIMEOUT')} right={moment.duration(timeout, 'ms').humanize()} />
                {unit ? <AdUnit unit={unit} unitMeta={unit._meta} t={t} /> : null}

            </Grid>
        </div >
    )
}