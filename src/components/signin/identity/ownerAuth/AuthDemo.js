import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import AuthHoc from './AuthHoc'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { ContentBox, ContentBody } from 'components/common/dialog/content'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'
import { AUTH_TYPES } from 'constants/misc'
import { getAccount, sigDemoMsg } from 'services/demo-account/demo-account'
import { signToken } from 'services/adex-node/actions'

class AuthDemo extends Component {
    authOnServer = () => {
    	const authToken = 'demo signature'
    	let mode = AUTH_TYPES.DEMO.signType
    	let authType = AUTH_TYPES.DEMO.name
    	let addr = null
    	let signature = null

    	getAccount()
    		.then((account) => {
    			addr = account.address
    			return sigDemoMsg({ msg: authToken, account })
    		})
    		.then(sig => {
    			signature = sig.sig
    			return signToken({ userid: addr, signature: signature.signature, authToken, mode: mode, hash: sig.hash, })
    		})
    		.then(res => {
    			return this.props.updateAcc({ res, addr, signature: signature.signature, mode, authType })
    		})
    }

    render() {
    	const { t, classes } = this.props
    	return (
    		<ContentBox className={classes.tabBox} >
    			<ContentBody>
    				<Typography paragraph variant='subheading'>
    					{t('DEMO_MODE_DESCRIPTION')}
    				</Typography>
    				<Button
    					onClick={this.authOnServer}
    					variant='contained'
    					color='primary'
    				>
    					{t('DEMO_AUTH')}
    				</Button>
    			</ContentBody>
    		</ContentBox>
    	)
    }
}

AuthDemo.propTypes = {
	actions: PropTypes.object.isRequired,
}

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
)(Translate(AuthHoc(withStyles(styles)(AuthDemo))))