import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import theme from './Signin.css'
import Logo from 'components/common/icons/AdexIconTxt'
import { Switch, Route } from 'react-router-dom'
import { Button } from 'react-toolbox/lib/button'
import { withReactRouterLink } from 'components/common/rr_hoc/RRHoc.js'
import lightwallet from 'eth-lightwallet'

import PageNotFound from 'components/page_not_found/PageNotFound'
import Dialog from 'react-toolbox/lib/dialog'
import Input from 'react-toolbox/lib/input'
import MaterialStepper from 'components/dashboard/forms/stepper/MaterialStepper'
import dialogTheme from 'components/dashboard/forms/theme.css'
import Chip from 'react-toolbox/lib/chip'
import Helper from 'helpers/miscHelpers'
import Step1 from 'components/signin/signin-steps/Step1'
import Step2 from 'components/signin/signin-steps/Step2'
import Step3 from 'components/signin/signin-steps/Step3'
import Step4, { SPINNER_KEY } from 'components/signin/signin-steps/Step4'
import Step1Restore from 'components/signin/signin-steps/Step1Restore'
import ValidItemHoc from 'components/dashboard/forms/ValidItemHoc'
import Translate from 'components/translate/Translate'
import { web3, getWeb3 } from 'services/smart-contracts/ADX'
import SideSelect from 'components/signin/side-select/SideSelect'

const RRButton = withReactRouterLink(Button)
const keystore = lightwallet.keystore

const ValidationIdBase = "SignInStep"

const CompleteBtn = ({ ...props }) => {
  return (
    <RRButton to={props.to} beforeTo={props.onSuccess} label={props.t('CHOOSE_SIDE')} primary />
  )
}

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

    console.log('this.props.account', this.props.account)
    console.log('this.state', this.state)
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
    account: persist.account,
    // signin: memory.signin,
    // TODO: make spinner to be obj with status and msg and use it while stepper loads
    // TODO: !!! fix the state update of the stepper bug in order to use the spinner it
    // spinner: memory.spinners[SPINNER_KEY] 
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