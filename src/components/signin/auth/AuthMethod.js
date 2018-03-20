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
import { Tab, Tabs } from 'react-toolbox'
import { Button } from 'react-toolbox/lib/button'
import { getWeb3 } from 'services/smart-contracts/ADX'
import AuthMetamask from 'components/signin/auth/AuthMetamask'

class AuthMethod extends Component {

  constructor(props) {
    super(props)
    this.state = {
      tabIndex: 0,
      closeDialog: false,
      bids: []
    }
  }

  handleTabChange = (index) => {
    this.setState({ tabIndex: index })
  }

  render() {
    // console.log('SideSelect', this.props)
    let t = this.props.t
    return (
      <Dialog
        active={true}
        title={t('CHOOSE_AUTH_METHOD')}
        theme={theme}
      >
        <Tabs
          theme={theme}
          index={this.state.tabIndex}
          onChange={this.handleTabChange.bind(this)}
        >
          <Tab label={t('METAMASK')}>
            <AuthMetamask />
          </Tab>
          <Tab label={t('TREZOR')}>
            <h1>{t('COMING_SOON')}</h1>
          </Tab>
          <Tab label={t('LEDGER')}>
            <h1>{t('COMING_SOON')}</h1>
          </Tab>
        </Tabs>

      </Dialog>
    )
  }
}

export default Translate(AuthMethod)
