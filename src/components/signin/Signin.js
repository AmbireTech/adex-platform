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
import SideSelect from './side-select/SideSelect'
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

const RRButton = withReactRouterLink(Button)
const keystore = lightwallet.keystore

const ValidationIdBase = "SignInStep"

const CompleteBtn = ({ ...props }) => {
  return (
    <RRButton to={props.to} beforeTo={props.onSuccess} label={props.t('CHOOSE_SIDE')} primary />
  )
}

class Signin extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dialogActive: false,
      method: ''
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log('nextProps', nextProps)
  // }

  componentWillMount() {
    this.props.actions.resetSignin()
  }

  handleToggle = (method) => {
    let active = this.state.dialogActive
    this.setState({ dialogActive: !active, method: method })
  }

  onSuccess = () => {
    // There is no need to reset the data as it is not persistent
    // The signin should be cleared on mount
    // this.props.actions.resetSignin()
    this.handleToggle()
  }

  renderDialog = () => {

    // TODO: make stepper keep step in the router
    let pagesCreate = [{
      title: 'Step 1',
      component: ValidItemHoc(Step1),
      props: { ...this.props, validateId: ValidationIdBase + 1 }
    },
    {
      title: 'Step 2',
      component: ValidItemHoc(Step2),
      props: { ...this.props, validateId: ValidationIdBase + 2 }
    },
    {
      title: 'Step 3',
      component: ValidItemHoc(Step3),
      props: { ...this.props, validateId: ValidationIdBase + 3 }
    },
    {
      title: 'Step 4',
      completeBtn: () => <CompleteBtn {...this.props} to="/side-select" onSuccess={this.onSuccess} />,
      component: ValidItemHoc(Step4),
      props: { ...this.props, validateId: ValidationIdBase + 4 }
    }]

    let pagesRecover = [{
      title: 'Step 1',
      component: ValidItemHoc(Step1Restore),
      props: { ...this.props, validateId: ValidationIdBase + 1 + 'Recover' }
    },
    {
      title: 'Step 2',
      completeBtn: () => <CompleteBtn {...this.props} to="/side-select" onSuccess={this.onSuccess} />,
      component: ValidItemHoc(Step4),
      props: { ...this.props, validateId: ValidationIdBase + 2 + 'Recover' }
    }]

    let pages

    if (this.state.method === 'create') {
      pages = pagesCreate
    } else {
      pages = pagesRecover
    }

    let t = this.props.t
    return (
      <Dialog
        theme={dialogTheme}
        active={this.state.dialogActive}
        onEscKeyDown={this.handleToggle}
        onOverlayClick={this.handleToggle}
        title={this.state.method === 'create' ? t('SIGNIN_CREATE_ACCOUNT') : t('SIGNIN_RESTORE_ACCOUNT')}
        type={this.props.type || 'normal'}
      >

        <div style={{ textAlign: 'center' }}>
          <MaterialStepper pages={pages} itemType={this.props.itemType} />
        </div>

      </Dialog>
    )
  }

  renderDefault = () => {
    return (
      <div>
        <div>
          <Logo width={370} height={144} />
        </div>
        <br />
        <Button
          icon='create'
          onClick={() => this.handleToggle('create')}
          color='secondary'
          variant='raised'
          label="Create new account"
        />
        <br />
        <br />
        <Button
          icon='import_export'
          onClick={() => this.handleToggle('restore')}
          color='primary'
          variant='raised'
          label="Restore account"
        />
        <this.renderDialog />
      </div>
    )
  }

  render() {
    return (
      <div className={theme.signinContainer} style={{ backgroundImage: `url(${require('resources/background.png')})` }}>
        <div className={theme.container}>
          <div className="adex-dapp">
            <Switch>
              <Route exact path="/" render={this.renderDefault.bind(this)} />
              <Route path="/side-select" component={SideSelect} />
              <Route component={PageNotFound} />
            </Switch>
          </div>
        </div>
      </div>
    )
  }
}

Signin.propTypes = {
  actions: PropTypes.object.isRequired,
}

// 
function mapStateToProps(state) {
  // let persist = state.persist
  // let memory = state.memory
  return {
    // account: persist.account,
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
)(Translate(Signin))