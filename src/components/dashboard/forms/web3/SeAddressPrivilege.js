import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import TextField from '@material-ui/core/TextField'
import Dropdown from 'components/common/dropdown'
import { validateNumber, isEthAddress } from 'helpers/validators'
import { constants } from 'adex-models'

const { IdentityPrivilegeLevel } = constants

const PRIV_LEVELS_SRC = Object.keys(IdentityPrivilegeLevel)
	.map(key => {
		return {
			value: IdentityPrivilegeLevel[key],
			label: key
		}
	})

class SeAddressPrivilege extends Component {

	componentDidMount() {
		if (!this.props.transaction.withdrawAmount) {
			this.props.validate('setAddr', {
				isValid: false,
				err: { msg: 'ERR_REQUIRED_FIELD' },
				dirty: false
			})
		}
	}

	validateAmount = (numStr, dirty) => {
		let isValid = validateNumber(numStr)
		let msg = 'ERR_INVALID_AMOUNT_VALUE'
		let errMsgArgs = []
		if (isValid && (parseFloat(numStr) > parseFloat(this.props.identityAvailable))) {
			isValid = false
			msg = 'ERR_MAX_AMOUNT_TO_WITHDRAW'
			errMsgArgs = [this.props.identityAvailable, 'DAI']
		}

		this.props.validate('withdrawAmount', { isValid: isValid, err: { msg: msg, args: errMsgArgs }, dirty: dirty })
	}

	validateAddress = (addr, dirty) => {
		const isValid = isEthAddress(addr)
		const msg = 'ERR_INVALID_ETH_ADDRESS'
		this.props.validate('setAddr', { isValid: isValid, err: { msg: msg }, dirty: dirty })
	}

	render() {
		const { transaction, t, invalidFields, identityAvailable, handleChange } = this.props
		const { setAddr, privLevel } = transaction || {}
		// const errAmount = invalidFields['withdrawAmount']
		const errAddr = invalidFields['withdrawTo']

		return (
			<div>
				<div> {t('SET_IDENTITY_PRIVILEGE_MAIN_INFO')} {identityAvailable} </div>
				<TextField
					type='text'
					required
					fullWidth
					label={t('ADDR_TO_SET_PRIV_LEVEL')}
					name='setAddr'
					value={setAddr || ''}
					onChange={(ev) => handleChange('setAddr', ev.target.value)}
					onBlur={() => this.validateAddress(setAddr, true)}
					onFocus={() => this.validateAddress(setAddr, false)}
					error={errAddr && !!errAddr.dirty}
					helperText={errAddr && !!errAddr.dirty ? errAddr.errMsg : ''}
				/>
				<Dropdown
					required
					label={t('SELECT_PRIV_LEVEL')}
					helperText={t('SELECT_PRIV_LEVEL_HELPER_TXT')}
					onChange={(val) => handleChange('privLevel', val)}
					source={PRIV_LEVELS_SRC}
					value={typeof privLevel === 'number' ? privLevel : ''}
					htmlId='label-privLevel'
					fullWidth
				/>
			</div>
		)
	}
}

SeAddressPrivilege.propTypes = {
	actions: PropTypes.object.isRequired,
	label: PropTypes.string,
	txId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	transaction: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired
}

function mapStateToProps(state, props) {
	// const persist = state.persist
	// const memory = state.memory
	const txId = props.stepsId
	return {
		txId: txId
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const SeAddressPrivilegeForm = NewTransactionHoc(SeAddressPrivilege)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SeAddressPrivilegeForm)
