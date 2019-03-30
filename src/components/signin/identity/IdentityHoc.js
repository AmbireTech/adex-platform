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
				identity: {},
				ready: false
			}
		}

		componentWillReceiveProps(nextProps) {
			this.setState({ identity: nextProps.identity })
		}

		componentDidMount() {
			this.setState({ identity: this.props.identity })
		}

		handleChange = (prop, value) => {
			this.props.actions.updateIdentity(prop, value)
		}

		save = () => {
			// console.log(this.state.identity)
			const {
				identityAddr,
				wallet,
				email
			} = this.state.identity

			const newWallet = { ...wallet }
			newWallet.authType = AUTH_TYPES.GRANT.name
			const identity = {
				address: identityAddr
			}
			this.props.actions.createSession({
				identity,
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
			const props = this.props
			const { identity } = this.state

			return (
				<Decorated
					{...props}
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

