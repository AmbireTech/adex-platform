import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import TextField from '@material-ui/core/TextField'
import Dropdown from 'components/common/dropdown'
import { constants } from 'adex-models'
import { InputLoading } from 'components/common/spinners/'

const { IdentityPrivilegeLevel } = constants

const PRIV_LEVELS_SRC = Object.keys(IdentityPrivilegeLevel).map(key => {
	return {
		value: IdentityPrivilegeLevel[key],
		label: key,
	}
})

class SeAddressPrivilege extends Component {
	componentDidMount() {
		const { transaction, validate } = this.props
		if (!transaction.withdrawAmount) {
			validate('setAddr', {
				isValid: false,
				err: { msg: 'ERR_REQUIRED_FIELD' },
				dirty: false,
			})
		}
	}

	render() {
		const {
			actions,
			transaction,
			t,
			invalidFields,
			identityAvailable,
			handleChange,
			setAddrSpinner,
			validate,
		} = this.props
		const { setAddr, privLevel } = transaction || {}
		// const errAmount = invalidFields['withdrawAmount']
		const errAddr = invalidFields['setAddr']

		return (
			<div>
				<div>
					{' '}
					{t('SET_IDENTITY_PRIVILEGE_MAIN_INFO')} {identityAvailable}{' '}
				</div>
				<TextField
					type='text'
					required
					fullWidth
					label={t('ADDR_TO_SET_PRIV_LEVEL')}
					name='setAddr'
					value={setAddr || ''}
					onChange={ev => handleChange('setAddr', ev.target.value)}
					onBlur={() =>
						actions.validateAddress({
							addr: setAddr,
							dirty: true,
							validate,
							name: 'setAddr',
						})
					}
					onFocus={() =>
						actions.validateAddress({
							addr: setAddr,
							dirty: false,
							validate,
							name: 'setAddr',
						})
					}
					error={errAddr && !!errAddr.dirty}
					helperText={errAddr && !!errAddr.dirty ? errAddr.errMsg : ''}
				/>
				{setAddrSpinner ? <InputLoading /> : null}
				<Dropdown
					required
					label={t('SELECT_PRIV_LEVEL')}
					helperText={t('SELECT_PRIV_LEVEL_HELPER_TXT')}
					onChange={val => handleChange('privLevel', val)}
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
	account: PropTypes.object.isRequired,
}

function mapStateToProps(state, props) {
	// const persist = state.persist
	const memory = state.memory
	const txId = props.stepsId
	return {
		txId: txId,
		setAddrSpinner: memory.spinners['setAddr'],
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

const SeAddressPrivilegeForm = NewTransactionHoc(SeAddressPrivilege)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SeAddressPrivilegeForm)
