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

const RRButton = withReactRouterLink(Button)
const keystore = lightwallet.keystore

class Signin extends Component {
  constructor(props) {
    super(props)
    this.state = {
      dialogActive: false,
      name: '',
      email: '',
      password: '',
      passConfirm: '',
      seed: [],
      publicKey: '',
      privateKey: '',
      encryptedPrivateKey: '',
      seedCheck: null
    }
  }

  handleToggle = () => {
    let active = this.state.dialogActive
    this.setState({ dialogActive: !active })
  }

  handleChange = (name, value) => {
    this.setState({ [name]: value })
  }

  stepOne = () => {
    return (
      <div>
        <Input
          type='text'
          label='Name'
          value={this.state.name}
          onChange={this.handleChange.bind(this, 'name')}
          maxLength={128} >
        </Input>
        <Input
          type='email'
          label='Email'
          value={this.state.email}
          onChange={this.handleChange.bind(this, 'email')}
          maxLength={128} >
        </Input>
        <Input
          type='password'
          label='Password'
          value={this.state.password}
          onChange={this.handleChange.bind(this, 'password')}
          maxLength={128} >
        </Input>
        <Input
          type='password'
          label='Confirm password'
          value={this.state.passConfirm}
          onChange={this.handleChange.bind(this, 'passConfirm')}
          maxLength={128} >
        </Input>
      </div>
    )
  }


  stepTwo = () => {
    let randomSeed = []
    if (!this.state.seed.length) {
      let extraEntropy = this.state.name + this.state.email + this.state.password + Date.now()
      randomSeed = keystore.generateRandomSeed(extraEntropy)
      randomSeed = randomSeed.split(' ')
      // TODO: make this on page change!! this in temp!!!
      this.setState({ seed: randomSeed })
    } else {
      randomSeed = this.state.seed
    }

    console.log('randomSeed', randomSeed)

    return (
      <div>
        <h2> This is your seed, please write it on paper or memorize it.</h2>
        <h4> Ww will check that on the next step :) </h4>
        {
          randomSeed.map((seed) => {
            return (
              <Chip key={seed}> {seed} </Chip>
            )
          })
        }
      </div>
    )
  }

  stepThree = () => {
    let randomSeedChecks = this.state.seedCheck || []
    if (!randomSeedChecks.length) {
      while (true) {
        let randIndex = Helper.getRandomInt(0, this.state.seed.length - 1)
        let hasThisCheck = !!randomSeedChecks.filter((check) => check.index === randIndex).length
        if (!hasThisCheck) {
          randomSeedChecks.push({
            index: randIndex,
            value: this.state.seed[randIndex],
            checkValue: ''
          })
        }
        if (randomSeedChecks.length === 4) {
          // TODO: make this on page change!! this in temp!!!
          this.setState({ seedCheck: randomSeedChecks })
          break
        }
      }
    }

    console.log('randomSeedChecks', randomSeedChecks)

    return (
      <div>
        {
          randomSeedChecks.map((seed, index) => {
            return (
              <Input
                key={seed.value}
                type='text'
                label={'Position ' + seed.index}
                value={randomSeedChecks[index].checkValue}
                onChange={this.handleChange.bind(this, 'passConfirm')}
                maxLength={128} >
              </Input>
            )
          })
        }
      </div>
    )
  }

  renderDialog = () => {

    let pages = [{
      title: 'Step 1',
      component: this.stepOne,
      props: { ...this.props }
    },
    {
      title: 'Step 2',
      component: this.stepTwo,
      props: { ...this.props }
    },
    {
      title: 'Step 3',
      component: this.stepThree,
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
