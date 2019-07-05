import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewTransactionHoc from './TransactionHoc'
import Tooltip from '@material-ui/core/Tooltip'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
// import { DEFAULT_GAS_PRICE } from 'services/smart-contracts/constants'
import { WalletAction } from 'components/dashboard/forms/FormsCommon'
import { PropRow, ContentBox, ContentBody, ContentStickyTop, FullContentSpinner } from 'components/common/dialog/content'
import Helper from 'helpers/miscHelpers'
import ListItemText from '@material-ui/core/ListItemText'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'

class TransactionPreview extends Component {

	constructor(props, context) {
		super(props, context)

		this.state = {
			gas: null,
			fees: null,
			errors: []
		}
	}

	componentDidMount() {
		if (this.props.getFeesFn && Object.keys(this.props.transaction).length) {

			this.props.actions.updateSpinner(this.props.txId, true)
			this.props.getFeesFn({ acc: this.props.account, transaction: this.props.transaction })
				.then((fees) => {
					this.setState({ fees })
					this.props.handleChange('fees', fees)
					this.props.actions.updateSpinner(this.props.txId, false)
				})
				.catch((err) => {
					console.log(err)
					this.props.actions.updateSpinner(this.props.txId, false)
					this.props.handleChange('errors', [Helper.getErrMsg(err)])
				})
		}
	}

	render() {
		const { transaction = {}, t, classes, account, previewWarnMsgs, spinner } = this.props
		const errors = transaction.errors || []
		const { withdrawTo, withdrawAmount, fees = {} } = transaction
		return (
			<div>
				{spinner ?
					<FullContentSpinner />
					:
					<ContentBox>
						{transaction.waitingForWalletAction ?
							<ContentStickyTop>
								<WalletAction t={t} authType={account._authType} />
							</ContentStickyTop> : null}
						<ContentBody>
							{errors.length ?
								errors.map((err, index) =>
									<PropRow
										key={index}
										classNameLeft={classes.error}
										classNameRight={classes.error}
										left={<ErrorIcon />}
										right={err}
									/>)
								: null}

							{previewWarnMsgs ?
								previewWarnMsgs.map((msg, index) =>
									<PropRow
										key={index}
										classNameLeft={classes.warning}
										classNameRight={classes.warning}
										left={<WarningIcon />}
										right={t(msg.msg, { args: msg.args })}
									/>
								)
								: null}

							<PropRow
								key='withdrawTo'
								left={t('withdrawTo', { isProp: true })}
								right={(withdrawTo || '').toString()}
							/>
							<PropRow
								key='withdrawAmount'
								left={t('withdrawAmount', { isProp: true })}
								right={
									<ListItemText
										className={classes.address}
										secondary={t('AMOUNT_WITHDRAW_INFO', { args: [fees.fees, 'DAI', fees.toGet, 'DAI'] })}
										primary={withdrawAmount + ' DAI'}
									/>
								}
							/>
						</ContentBody>
					</ContentBox>
				}
			</div>
		)
	}
}

TransactionPreview.propTypes = {
	actions: PropTypes.object.isRequired,
	label: PropTypes.string,
	txId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	transaction: PropTypes.object.isRequired,
	account: PropTypes.object.isRequired,
	previewMsgs: PropTypes.array,
	estimateGasFn: PropTypes.func
}

function mapStateToProps(state, props) {
	const persist = state.persist
	const memory = state.memory
	const txId = props.stepsId
	return {
		transaction: memory.newTransactions[txId] || {},
		txId: txId,
		spinner: memory.spinners[txId],
		account: persist.account
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch)
	}
}

const TransactionPreviewForm = NewTransactionHoc(TransactionPreview)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(TransactionPreviewForm))
