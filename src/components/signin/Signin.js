import React, { Component } from 'react'
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

const RRButton = withReactRouterLink(Button)
const keystore = lightwallet.keystore

class Signin extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dialogActive: false
    }
  }

  handleToggle = () => {
    let active = this.state.dialogActive
    this.setState({ dialogActive: !active })
  }


  renderDialog = () => {

    let pages = [{
      title: 'Step 1',
      component: Step1,
      props: { ...this.props }
    },
    {
      title: 'Step 2',
      component: Step2,
      props: { ...this.props }
    },
    {
      title: 'Step 3',
      component: Step3,
      props: { ...this.props }
    }]

    return (
      <Dialog
        theme={dialogTheme}
        active={this.state.dialogActive}
        onEscKeyDown={this.handleToggle}
        onOverlayClick={this.handleToggle}
        title="Create account"
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
        <Button icon='create' onClick={this.handleToggle} accent raised label="Create new account" />
        <this.renderDialog />
        {/* 
        <RRButton to="/dashboard" icon='directions_walk' label='Go to dashboard' accent />
        <RRButton to="/side-select" icon='wc' label='Choose you side' /> 
        */}
      </div>
    )
  }

  render() {
    // console.log('theme.signinContainer', theme);
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
    );
  }
}

export default Signin;
