import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import AuthMethod from 'components/signin/identity/ownerAuth/AuthMethod'
import Translate from 'components/translate/Translate'
import { getSig } from 'services/auth/auth'
import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { getDeployTx, getRandomAddressForDeployTx } from 'services/idenity/contract-address'
import color from '@material-ui/core/colors/lightBlue';

class IdentityContractAddress extends Component {

	constructor(props, context) {
		super(props, context)
		this.state = {
		}
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		if (prevProps.identity.identityContractOwner != this.props.identity.identityContractOwner) {
			this.props.validate('identityContractOwner', {
				isValid: !!this.props.identity.identityContractOwner,
				err: { msg: 'ERR_NO_IDENTITY_CONTRACT_OWNER' },
				dirty: true
			})
		}
	}

	componentDidMount() {
		console.log('this props ico', this.props)
		this.props.validate('identityContractOwner', {
			isValid: !!this.props.identity.identityContractOwner,
			err: { msg: 'ERR_NO_IDENTITY_CONTRACT_OWNER' },
			dirty: false
		})
	}

    getIdentityContracAddress = (extraEntropy = '') => {
    	const deployTx = getDeployTx({
    		addr: '0x0A8fe6e91eaAb3758dF18f546f7364343667E957',
    		privLevel: 3,
    		feeTokenAddr: '0x4470BB87d77b963A013DB939BE332f927f2b992e',
    		feeBeneficiary: '0x0A8fe6e91eaAb3758dF18f546f7364343667E957',
    		feeTokenAmount: '10000'
    	})
    }

    render() {
    	const { identity, t } = this.props
    	const { extraEntropyIdentityContract, identityContractAddress } = identity || {}

    	return (
    		<AuthMethod />
    	)
    }
}

IdentityContractAddress.propTypes = {
	actions: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state) {
	let persist = state.persist
	// let memory = state.memory
	return {
		account: persist.account,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const IdentityContractAddressStep = IdentityHoc(IdentityContractAddress)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Translate(IdentityContractAddressStep))
