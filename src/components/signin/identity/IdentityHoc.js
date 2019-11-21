import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions, { execute } from 'actions'
import { push } from 'connected-react-router'

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
			const { account } = this.props
			if (account.wallet.authSig) {
				execute(push('/side-select'))
			}
		}

		save = async () => {
			const { identity, actions } = this.props
			const {
				wallet,
				email,
				identityData,
				identityTxData,
				deleteLegacyKey,
				registerAccount,
			} = identity

			const newWallet = { ...wallet }

			if (registerAccount) {
				await actions.registerAccount({
					owner: newWallet.address,
					identityTxData,
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
			const { resetIdentity } = this.props.actions
			resetIdentity()
			execute(push('/'))
		}

		keyDown(e) {
			switch (e.key) {
				case 'Enter':
					console.log('validate')
					break
				case 'Escape':
					this.cancel()
					break
				default:
					break
			}
		}

		render() {
			const { identity, spinner, waitingExpected, ...rest } = this.props

			return (
				<span onKeyDown={e => this.keyDown(e)}>
					<Decorated
						{...rest}
						autoFocus
						identity={identity}
						save={this.save}
						handleChange={this.handleChange}
						cancel={this.cancel}
						waiting={spinner}
						waitingExpected={waitingExpected}
					/>
				</span>
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
