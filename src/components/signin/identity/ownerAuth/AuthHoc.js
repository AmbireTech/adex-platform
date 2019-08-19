import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import IdentityHoc from '../IdentityHoc'
import ValidItemHoc from 'components/common/stepper/ValidItemHoc'

export default function AuthHoc(Decorated) {
	class Auth extends Component {
		constructor(props) {
			super(props)
			this.state = {
				method: '',
				sideSelect: false,
			}
		}

		updateWallet = ({
			address,
			authType,
			hdWalletAddrPath,
			hdWalletAddrIdx,
			path,
			chainId,
			signType,
			balanceEth,
			balanceDai,
		}) => {
			const wallet = {
				address,
				authType,
				hdWalletAddrPath,
				hdWalletAddrIdx,
				path,
				chainId,
				signType,
				balanceEth,
				balanceDai,
			}

			this.props.handleChange('identityContractOwner', address)
			this.props.handleChange('wallet', wallet)
		}

		render() {
			return (
				<Decorated
					{...this.props}
					// updateAcc={this.updateAcc}
					updateWallet={this.updateWallet}
				/>
			)
		}
	}

	Auth.propTypes = {
		actions: PropTypes.object.isRequired,
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
			actions: bindActionCreators(actions, dispatch),
		}
	}

	return connect(
		mapStateToProps,
		mapDispatchToProps
	)(Translate(ValidItemHoc(IdentityHoc(Auth))))
}
