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
import AuthTrezor from 'components/signin/auth/AuthTrezor'
import AuthLedger from 'components/signin/auth/AuthLedger'
import Logo from 'components/common/icons/AdexIconTxt'

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
    let t = this.props.t
    return (
      <Dialog
        active={true}
        title={t('CHOOSE_AUTH_METHOD')}
        theme={theme}        
        type='large'
      >
        <div>
          <div className={theme.adexLogoTop} >
            <Logo className={theme.logo} />
          </div>
          <Tabs
            theme={theme}
            index={this.state.tabIndex}
            onChange={this.handleTabChange.bind(this)}
          >
            <Tab label={t('METAMASK')}>
              <AuthMetamask />
            </Tab>
            <Tab label={t('TREZOR')}>
              <AuthTrezor />
            </Tab>
            <Tab label={t('LEDGER')}>
              <AuthLedger />
            </Tab>
          </Tabs>
        </div>

      </Dialog>
    )
  }
}

export default Translate(AuthMethod)
