import React, { Component } from 'react'
import PropTypes from 'prop-types'
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

const RRButton = withReactRouterLink(Button)

class SigninMetamask extends Component {
  constructor(props) {
    super(props)
    this.state = {
      method: '',
      sideSelect: false
    }
  }

  // TODO: Make it some common function if needed or make timeout as metamask way 
  checkMetamask = () => {
    getWeb3.then(({ web32 }) => {

      web32.eth.getAccounts((err, accounts) => {
        let user = accounts[0]

        if (err || !user) {
          this.props.actions.resetAccount()
        } else {
          this.props.actions.updateAccount({ ownProps: { _temp: { addr: user } } })
        }
      })
    })
  }

  renderDefault = () => {
    let user = this.props.account._temp && this.props.account._temp.addr

    return (
      <div>
        <div>
          <Logo width={370} height={144} />
        </div>
        <br />
        {!!user ?
          <Button onClick={() => { this.setState({ sideSelect: !this.state.sideSelect }) }} label={this.props.t('CHOOSE_SIDE')} primary />
          :
          // TODO: metamask dl nad how to
          <h1> Login to metamask <Button onClick={this.checkMetamask} label={this.props.t('OK')} primary /></h1>
        }
        <SideSelect active={this.state.sideSelect} />
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