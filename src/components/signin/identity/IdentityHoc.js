import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import { AUTH_TYPES } from 'constants/misc'

export default function IdentityHoc(Decorated) {

	class IdentityForm extends Component {
		constructor(props) {
			super(props)

			this.save = this.save.bind(this);

			this.state = {
				ready: false
			}
		}

		handleChange = (prop, value) => {
			this.props.actions.updateIdentity(prop, value)
		}

		save = () => {
			const { identity, actions } = this.props
			const {
				identityAddr,
				wallet,
				email
			} = identity

			const newWallet = { ...wallet }
			newWallet.authType = AUTH_TYPES.GRANT.name
			const accountIdentity = {
				address: identityAddr
			}
			actions.createSession({
				identity: accountIdentity,
				wallet: newWallet,
				email
			})
		}

		cancel = () => {
			const { resetIdentity } = this.props.actions
			resetIdentity()
			this.props.history.push('/')
		}

		render() {
			const { identity, ...rest } = this.props

			return (
				<Decorated
					{...rest}
					identity={identity}
					save={this.save}
					handleChange={this.handleChange}
					cancel={this.cancel}
				/>
			)
		}
	}

	IdentityForm.propTypes = {
		actions: PropTypes.object.isRequired,
		account: PropTypes.object.isRequired,
		identity: PropTypes.object.isRequired
	}

	function mapStateToProps(state, props) {
		let persist = state.persist
		let memory = state.memory
		return {
			account: persist.account,
			identity: memory.identity
		}
	}

	function mapDispatchToProps(dispatch) {
		return {
			actions: bindActionCreators(actions, dispatch)
		}
	}

	return connect(
		mapStateToProps,
		mapDispatchToProps
	)(IdentityForm)
}

