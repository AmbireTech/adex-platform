import React, { Component } from 'react'
import PropTypes, { node } from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Logo from 'components/common/icons/AdexIconTxt'
import Translate from 'components/translate/Translate'
import SideSelect from 'components/signin/side-select/SideSelect'
import AuthMethod from 'components/signin/auth/AuthMethod'
import { getSig } from 'services/auth/auth'
import packageJson from './../../../package.json'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class SigninExternalWallet extends Component {
  constructor(props) {
    super(props)
    this.state = {
      method: '',
      sideSelect: false
    }
  }

  renderDefault = () => {
    const { account } = this.props
    const lsSig = getSig({ addr: account._addr, mode: account._authType })
    const hasSession = !!lsSig && !!account._authSig && (lsSig === account._authSig)

    return (
      <div>
        {/* <div className={theme.adexLogo} >
          <Logo width={247} height={96} />
        </div> */}
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
    const { classes } = this.props
    return (
      <div className={classes.signinContainer} style={{ backgroundImage: `url(${require('resources/background.png')})` }}>
        <div className={classes.container}>
          <div className="adex-dapp">
            <div className={classes.adexLogoTop} >
              <Logo className={classes.logo} />
            </div>
            <this.renderDefault />
            <small className={classes.adxVersion} >
              v.{packageJson.version}-beta
            </small>
          </div>
        </div>
      </div>
    )
  }
}

SigninExternalWallet.propTypes = {
  actions: PropTypes.object.isRequired,
}

// 
function mapStateToProps(state) {
  const persist = state.persist
  // const memory = state.memory
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
)(Translate(withStyles(styles)(SigninExternalWallet)))