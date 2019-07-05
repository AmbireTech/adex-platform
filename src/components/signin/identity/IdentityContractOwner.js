import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import IdentityHoc from './IdentityHoc'
import AuthMethod from 'components/signin/identity/ownerAuth/AuthMethod'
import Translate from 'components/translate/Translate'

class IdentityContractAddress extends Component {

	componentDidMount() {
		this.validateContractOwner()
	}

	componentDidUpdate(prevProps) {
		const currOwner = this.props.identity.identityContractOwner
		if (!!currOwner &&
			(currOwner !== prevProps.identity.identityContractOwner)) {
			this.validateContractOwner()
		}
	}

	validateContractOwner = () => {
		const { validate, identity } = this.props
		const { identityContractOwner } = identity

		validate('identityContractOwner', {
			isValid: !!identityContractOwner,
			err: { msg: 'ERR_NO_IDENTITY_CONTRACT_OWNER' },
			dirty: false
		})
	}

	render() {
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
	const { persist } = state
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
