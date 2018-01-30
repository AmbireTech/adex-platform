import React, { Component } from 'react'
import theme from './theme.css'
import PublisherLogo from 'components/common/icons/AdexPublisher'
import AdvertiserLogo from 'components/common/icons/AdexAdvertiser'
import AuctionLogo from 'components/common/icons/AdexAuction'
// import { Link } from 'react-router-dom'
import Dialog from 'react-toolbox/lib/dialog'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import classnames from 'classnames'

const SideBox = ({ salePoints = [], linkTitle, icon, title, disabled, ...other }) => (
  <div {...other} className={classnames(theme.sideBox, { [theme.disabled]: disabled })} >
    <div className={theme.icon}>
      {icon}
    </div>
    <h2>{title}</h2>
    <ul className={theme.salePoints}>
      {salePoints.map(function (point, key) {
        return (<li key={key}> {point} </li>)
      })}
    </ul>
  </div >
)

const RRSideBox = withReactRouterLink(SideBox)

class SideSelect extends Component {

  render() {
    // console.log('SideSelect', this.props)
    let t = this.props.t
    return (
      <div >
        <Dialog
          active={true}
          title={t('CHOOSE_SIDE')}
        >

          <RRSideBox
            title={t('ADVERTISER')}
            icon={<AdvertiserLogo />}
            // salePoints={[t('SALE_POINT_ADV_1'), t('SALE_POINT_ADV_2'), t('SALE_POINT_ADV_3')]}
            to='/dashboard/advertiser'
            linkTitle={t('GO_ADVERTISER')}
          // disabled
          />

          <RRSideBox
            title={t('PUBLISHER')}
            icon={<PublisherLogo />}
            // salePoints={[t('SALE_POINT_PUB_1'), t('SALE_POINT_PUB_2'), t('SALE_POINT_PUB_3')]}
            to='/dashboard/publisher'
            linkTitle={t('GO_PUBLISHER')}
          // disabled
          />

        </Dialog>
      </div>
    );
  }
}

export default Translate(SideSelect)
