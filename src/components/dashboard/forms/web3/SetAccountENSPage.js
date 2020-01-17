import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
// import Translate from 'components/translate/Translate'
import NewTransactionHoc from './TransactionHoc'
import TextField from '@material-ui/core/TextField'
import { InputLoading } from 'components/common/spinners/'
import InputAdornment from '@material-ui/core/InputAdornment'
import Lottie from 'react-lottie'
import * as success from 'resources/animations/success.json'

const defaultOptions = {
	loop: false,
	autoplay: true,
	animationData: success.default,
	rendererSettings: {
		preserveAspectRatio: 'xMidYMid slice',
	},
}
class SetAccountENSPage extends Component {
	componentDidMount() {
		const { transaction, validate } = this.props
		if (!transaction.withdrawAmount) {
			validate('setEns', {
				isValid: false,
				err: { msg: 'ERR_REQUIRED_FIELD' },
				dirty: false,
			})
		}
	}

	componentWillUnmount() {
		this.props.handleChange('setEns', '')
	}

	handleValidate = () => {
		if (this._timeout) {
			//if there is already a timeout in process cancel it
			clearTimeout(this._timeout)
		}
		this._timeout = setTimeout(() => {
			this._timeout = null
			const { actions, transaction, validate } = this.props
			const { setEns } = transaction || {}
			actions.validateENS({
				ens: setEns,
				dirty: true,
				validate,
				name: 'setEns',
			})
		}, 500)
	}

	render() {
		const {
			transaction,
			t,
			invalidFields,
			handleChange,
			setEnsSpinner,
		} = this.props
		const { setEns } = transaction || {}
		// const errAmount = invalidFields['withdrawAmount']
		const errAddr = invalidFields['setEns']
		return (
			<div>
				<div> {t('SET_ENS_MAIN_INFO')}</div>
				<form noValidate>
					<TextField
						autoFocus
						type='text'
						required
						fullWidth
						label={t('ENS_TO_SET_TO_ADDR')}
						name='setEns'
						value={setEns || ''}
						onChange={ev => {
							handleChange('setEns', ev.target.value)
							this.handleValidate()
						}}
						InputProps={{
							endAdornment: (
								<InputAdornment position='end'>
									{`.${process.env.REVERSE_REGISTRAR_PARENT}`}
								</InputAdornment>
							),
						}}
						error={errAddr && !!errAddr.dirty}
						helperText={errAddr && !!errAddr.dirty ? errAddr.errMsg : ''}
					/>
					{setEnsSpinner ? <InputLoading /> : null}
				</form>
				{setEns && !errAddr && (
					<Lottie options={defaultOptions} height={400} width={400}></Lottie>
				)}
			</div>
		)
	}
}

SetAccountENSPage.propTypes = {
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
		setEnsSpinner: memory.spinners['setEns'],
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

const SetAccountENSPageForm = NewTransactionHoc(SetAccountENSPage)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SetAccountENSPageForm)
