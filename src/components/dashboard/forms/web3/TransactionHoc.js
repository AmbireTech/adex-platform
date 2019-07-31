import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import Translate from 'components/translate/Translate'
import Helper from 'helpers/miscHelpers'
// import { exchange as ExchangeConstants } from 'adex-constants'

// const { TX_STATUS } = ExchangeConstants

export default function NewTransactionHoc(Decorated) {
	// TODO: make it common for bids and items
	class TransactionHoc extends Component {
		componentWillMount() {
			// console.log('TransactionHoc')
		}

		handleChange = (name, value) => {
			const { actions, txId } = this.props
			actions.updateNewTransaction({ tx: txId, key: name, value: value })
		}

		// addTx = (tx) => {
		//     let txData = { ...tx }
		//     txData.status = TX_STATUS.Pending.id
		//     txData.sendingTime = Date.now()
		//     this.props.actions.addWeb3Transaction({ trans: txData, addr: this.props.account._addr })
		// }

		onSave = (err, tx, manyTxs) => {
			const { closeDialog } = this.props

			if (closeDialog) {
				closeDialog()
			}

			this.resetTransaction()
		}

		resetTransaction = () => {
			const { actions, txId } = this.props
			actions.resetNewTransaction({ tx: txId })
		}

		handleSaveRes = ({ err, res }) => {
			const { t, actions } = this.props
			// const areManyTxs = Array.isArray(res)

			if (err) {
				actions.addToast({ type: 'cancel', action: 'X', label: t('ERR_TRANSACTION', { args: [Helper.getErrMsg(err)] }), timeout: 50000 })
			}

			this.onSave(err, res, Array.isArray(res))
		}

		save = () => {
			this.handleChange('waitingForWalletAction', true)
			this.props.saveFn({ acc: this.props.account, transaction: this.props.transaction })
				.then((res = {}) => {
					console.log('res on save', res)

					const txs = res.txResults || res
					const err = res.err || null

					this.handleSaveRes({ err: err, res: txs })
				})
				.catch((error = {}) => {
					console.log('err on save', error)
					const res = error.txResults || null
					const err = error.err || error

					this.handleSaveRes({ err: err, res: res })
				})
		}

		cancel = () => {
			// TODO: take a look at onSave if change something
			this.onSave(null, null)
		}

		render() {
			let transaction = this.props.transaction || {}
			let props = this.props

			return (
				<Decorated
					{...props}
					transaction={transaction}
					save={this.save}
					cancel={this.cancel}
					handleChange={this.handleChange}
					resetTransaction={this.resetTransaction}
				/>
			)
		}
	}

	TransactionHoc.propTypes = {
		actions: PropTypes.object.isRequired,
		label: PropTypes.string,
		stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
		transaction: PropTypes.object.isRequired,
		account: PropTypes.object.isRequired,
		saveFn: PropTypes.func
	}

	function mapStateToProps(state, props) {
		const { persist, memory } = state
		const txId = props.stepsId

		return {
			account: persist.account,
			transaction: memory.newTransactions[txId] || {},
			txId: txId,
			spinner: memory.spinners[txId],
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
	)(Translate(TransactionHoc))
}
