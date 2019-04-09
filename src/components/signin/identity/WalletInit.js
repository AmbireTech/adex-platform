import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Translate from 'components/translate/Translate'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import { getRandomMnemonic } from 'services/wallet/wallet'

class WalletInit extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
			mnemonic: props.wallet.mnemonic
		}
	}

	componentDidMount() {
		this.props.validate('mnemonic', {
			isValid: !!this.props.identity.identityContractAddress,
			err: { msg: 'ERR_NO_MNEMONIC' },
			dirty: false
		})
	}

    getMnemonic = () => {
    	const mnemonic = getRandomMnemonic()
    	this.props.handleChange('mnemonic', mnemonic)
    	this.props.validate('mnemonic', {
    		isValid: true
    	})
    } 

    render() {
    	const {t, identity} = this.props
    	return (
    		<div>
    			<Button
    				onClick={this.getMnemonic}
    				variant='raised'
    				color='primary'
    				disabled={this.state.waitingAddrData}
    			>
    				{t('WALLET_GET_RANDOM_MNEMONIC_BTN')}
    			</Button>
    			<Typography paragraph variant='subheading'>
    				{t('WALLET_GET_RANDOM_MNEMONIC_INFO')}
    			</Typography>
    			<Typography paragraph variant='subheading'>
    				{identity.mnemonic}
    			</Typography>
    			{identity.mnemonic &&
                <Typography paragraph variant='subheading'>
                	{t('WALLET_GET_RANDOM_MNEMONIC_WRITE_DOWN_INFO')}
                </Typography>}
    		</div>
    	)
    }
}

WalletInit.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
	let persist = state.persist
	let memory = state.memory
	return {
		account: persist.account,
		wallet: memory.wallet
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const IdentityWalletInitStep = IdentityHoc(WalletInit)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(withStyles(styles)(IdentityWalletInitStep)))