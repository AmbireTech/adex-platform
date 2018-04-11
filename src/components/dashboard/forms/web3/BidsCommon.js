import React from 'react'
import { Grid, Row, Col } from 'react-flexbox-grid'
import Img from 'components/common/img/Img'
import theme from './../theme.css'
import { Item } from 'adex-models'
import UnitTargets from 'components/dashboard/containers/UnitTargets'
import { adxToFloatView } from 'services/smart-contracts/utils'
import moment from 'moment'
import Anchor from 'components/common/anchor/anchor'
import { PropRow } from 'components/dashboard/forms/FormsCommon'
import { FontIcon } from 'react-toolbox/lib/font_icon'

export const AdUnit = ({ unit = {}, unitMeta = {}, t }) =>
    <div>
        <PropRow
            left={t('UNIT_NAME')}
            right={unitMeta.fullName}
        />
        <PropRow
            left={t('UNIT_URL')}
            right={<Anchor target='_blank' href={unitMeta.ad_url} > {unitMeta.ad_url} </Anchor>}
        />
        <PropRow
            left={t('UNIT_BANNER')}
            right={<Img className={theme.imgPreview} src={Item.getImgUrl(unitMeta.img, process.env.IPFS_GATEWAY) || ''} alt={unitMeta.fullName} />}
        />
        <PropRow
            left={t('UNIT_IPFS')}
            right={<Anchor target='_blank' href={process.env.IPFS_GATEWAY + unit._ipfs} > {unit._ipfs} </Anchor>}
        />
        <PropRow
            left={t('ADVERTISER')}
            right={<Anchor target='_blank' href={process.env.ETH_SCAN_ADDR_HOST + unitMeta.owner} > {unitMeta.owner} </Anchor>}
        />
        <PropRow
            eft={t('UNIT_TARGETS')}
            right={<UnitTargets targets={unitMeta.targets} t={t} />}
        />
    </div>

export const Report = ({ report = {}, t }) =>
    <div>
        <PropRow
            left={t('BID_REPORT_IPFS')}
            right={<Anchor target='_blank' href={process.env.IPFS_GATEWAY + report.ipfs} > {report.ipfs} </Anchor>}
        />
        <PropRow
            left={t('BID_REPORT_VERIFIED_UNIQUE_CLICKS')}
            right={report.report.verifiedUniqueClicks}
        />
        <PropRow
            left={t('BID_REPORT_ALL_CLICKS')}
            right={report.report.allClicks}
        />
    </div>

export const BidInfo = ({ bid, slot, unit, t, report, errMsg, errArgs, ...rest }) => {

    const accepted = (bid._acceptedTime || 0) * 1000
    const timeout = (bid._timeout || 0) * 1000
    const bidExpires = accepted ? (accepted + timeout) : null

    return (
        <div className={theme.itemPropTop}>
            <Grid fluid style={{ padding: 0 }}>
                {errMsg ?
                    <PropRow
                        className={theme.error}
                        left={<span> <FontIcon value='error' /> </span>}
                        right={t(errMsg, { args: errArgs })}
                    />
                    : null}
                <PropRow
                    left={t('BID_ID')}
                    right={bid._id}
                />
                <PropRow
                    left={t('BID_TARGET')}
                    right={bid._target}
                />
                <PropRow
                    left={t('BID_AMOUNT')}
                    right={adxToFloatView(bid._amount) + ' ADX'}
                />
                <PropRow
                    left={t('BID_TIMEOUT')}
                    right={moment.duration(timeout, 'ms').humanize()}
                />
                {accepted ?
                    <PropRow
                        left={t('BID_ACCEPTED_TIME')}
                        right={moment(accepted).format('MMMM Do, YYYY, HH:mm:ss')}
                    />
                    : null}
                {bidExpires ?
                    <PropRow
                        left={t('BID_EXPIRE_TIME')}
                        right={moment(bidExpires).format('MMMM Do, YYYY, HH:mm:ss')}
                    />
                    : null}
                {report ?
                    <Report report={report} t={t} />
                    : null}
                {unit ? <AdUnit unit={unit} unitMeta={unit._meta} t={t} /> : null}

            </Grid>
        </div >
    )
}