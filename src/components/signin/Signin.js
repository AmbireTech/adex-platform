import React, { Component } from 'react'
import theme from './Signin.css'
import Logo from './../common/icons/AdexIconTxt'
import { Link, Switch, Route } from 'react-router-dom'
import { Button } from 'react-toolbox/lib/button'
import { withReactRouterLink } from './../common/rr_hoc/RRHoc.js'

import PageNotFound from './../page_not_found/PageNotFound'
import SideSelect from './side-select/SideSelect'

const RRButton = withReactRouterLink(Button)

class Signin extends Component {

  renderDefault = () => {
    return (
      <div>
        <div>
          <Logo width={370} height={144} />
        </div>
        <br />

        <RRButton to="/dashboard" icon='directions_walk' label='Go to dashboard' accent />
        <RRButton to="/side-select" icon='wc' label='Choose you side' />
      </div>
    )
  }

  render() {
    // console.log('theme.signinContainer', theme);
    return (
      <div className={theme.signinContainer} style={{ backgroundImage: `url(${require('./../../resources/background.png')})` }}>
        <div className={theme.container}>
          <div className="adex-dapp">
            <Switch>
              <Route exact path="/" render={this.renderDefault} />
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
