import React, { Component } from 'react'
import PropTypes, { node } from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './Signin.css'
import Logo from 'components/common/icons/AdexIconTxt'
import { Button } from 'react-toolbox/lib/button'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import Translate from 'components/translate/Translate'
import { getWeb3 } from 'services/smart-contracts/ADX'
import SideSelect from 'components/signin/side-select/SideSelect'
import AuthMethod from 'components/signin/auth/AuthMethod'

const RRButton = withReactRouterLink(Button)

class SigninMetamask extends Component {
  constructor(props) {
    super(props)
    this.state = {
      method: '',
      sideSelect: false
    }
  }

  checkAuth = ({ addr, mode, exp }) => {
    if (!addr || !mode) return false

    let lsSig = localStorage.getItem('addr-' + mode + '-' + addr)
    let hasSig = !!lsSig

    return hasSig
  }

  renderDefault = () => {
    let userAddr = this.props.account._addr
    let authMode = this.props.account._authMode
    let hasSession = this.checkAuth({ addr: userAddr, mode: authMode })

    console.log('hassession', hasSession)

    return (
      <div>
        <div>
          <Logo width={370} height={144} />
        </div>
        <br />
        {hasSession ?
          <SideSelect active={true} />
          :
          <AuthMethod />
        }

      </div>
    )
  }

  render() {
    return (
      <div className={theme.signinContainer} style={{ backgroundImage: `url(${require('resources/background.png')})` }}>
        <div className={theme.container}>
          <div className="adex-dapp">
            <this.renderDefault />
          </div>
        </div>
      </div>
    )
  }
}

SigninMetamask.propTypes = {
  actions: PropTypes.object.isRequired,
}

// 
function mapStateToProps(state) {
  let persist = state.persist
  // let memory = state.memory
  return {
    account: persist.account
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(actions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Translate(SigninMetamask))