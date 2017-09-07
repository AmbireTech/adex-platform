import React, { Component } from 'react';
import theme from './Signin.css';
import Logo from './../common/icons/AdexIconTxt';
import { Link, Switch, Route } from 'react-router-dom';

import PageNotFound from './../page_not_found/PageNotFound';
import SideSelect from './side-select/SideSelect'

class Signin extends Component {

  renderDefault = () => {
    return (
      <div>
        <Logo  width={370} height={144} />
        <Link to="/dashboard" > Go to dashboard to dashboard </Link>
        <Link to="/side-select" >Choose you side</Link>
      </div>
    )
  }

  render() {
    // console.log('theme.signinContainer', theme);
    return (
      <div className={theme.signinContainer} style={{backgroundImage: `url(${require('./../../resources/background.png')})`}}>
        <div className={theme.container}>
          <h1> Signin </h1>

            <div className="adex-dapp">
              <Switch>
                <Route exact path="/" render={this.renderDefault}  />
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
