import React, { Component } from 'react'
import theme from './theme.css'
import PublisherLogo from 'components/common/icons/AdexPublisher'
import AdvertiserLogo from 'components/common/icons/AdexAdvertiser'
// import { Link } from 'react-router-dom'
import Dialog from 'react-toolbox/lib/dialog'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'

const SideBox = ({ salePoints, linkTitle, icon, title, ...other }) => (
  <div {...other} className={theme.sideBox}>
    <div className={theme.icon}>
      {icon}
    </div>
    <h2>{title}</h2>
    <ul className={theme.salePoints}>
      {salePoints.map(function (point, key) {
        return (<li key={key}> {point} </li>)
      })}
    </ul>
  </div>
)

const RRSideBox = withReactRouterLink(SideBox)

class SideSelect extends Component {

  render() {
    console.log('SideSelect', this.props);
    return (
      <div >
        <Dialog
          active={true}
          title='Choose a your side'
        >

          <RRSideBox
            title={this.props.t("ADVERTISER")}
            icon={<AdvertiserLogo />}
            salePoints={['Have Something to sell', 'Have ADX']}
            to="/dashboard/advertiser"
            linkTitle="Go to advertiser to advertise"
          />

          <RRSideBox
            title={this.props.t("PUBLISHER")}
            icon={<PublisherLogo />}
            salePoints={['Decentralization', 'Want ADX']}
            to="/dashboard/publisher"
            linkTitle="Go to publisher to publish"
          />

        </Dialog>
      </div>
    );
  }
}

export default Translate(SideSelect)
