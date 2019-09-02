import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'

export default function IdentityHoc(Decorated) {
	class IdentityForm extends Component {
		constructor(props) {
			super(props)

			this.save = this.save.bind(this)

			this.state = {
				ready: false,
			}
		}

		handleChange = (prop, value) => {
			this.props.actions.updateIdentity(prop, value)
		}

		componentDidUpdate = () => {
			const { account, history } = this.props
			if (!!history && account.wallet.authSig) {
				history.push('/side-select')
			}
		}

		save = async () => {
			const { identity, actions } = this.props
			const {
				wallet,
				email,
				identityData,
				deleteLegacyKey,
				registerAccount,
			} = identity

			const newWallet = { ...wallet }

			if (registerAccount) {
				await actions.registerAccount({
					wallet: newWallet,
					identityData,
					email,
				})
			}

			actions.createSession({
				identity: identityData,
				wallet: newWallet,
				email,
				registerExpected: !identityData,
				deleteLegacyKey,
			})
		}

		cancel = () => {
			this.props.history.push('/')
		}

		render() {
			const { identity, spinner, waitingExpected, ...rest } = this.props

			return (
				<Decorated
					{...rest}
					identity={identity}
					save={this.save}
					handleChange={this.handleChange}
					cancel={this.cancel}
					waiting={spinner}
					waitingExpected={waitingExpected}
				/>
			)
		}
	}

	IdentityForm.propTypes = {
		actions: PropTypes.object.isRequired,
		account: PropTypes.object.isRequired,
		identity: PropTypes.object.isRequired,
	}

	function mapStateToProps(state, props) {
		const { persist, memory } = state
		return {
			account: persist.account,
			identity: memory.identity,
			spinner: memory.spinners['creating-session'],
			waitingExpected: memory.spinners['getting-expected-identity'],
			waitingUpload: memory.spinners['uploading-account-data'],
		}
	}

	function mapDispatchToProps(dispatch) {
		return {
			actions: bindActionCreators(actions, dispatch),
		}
	}

	return connect(
		mapStateToProps,
		mapDispatchToProps
	)(IdentityForm)
}
