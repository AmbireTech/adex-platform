import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import actions from 'actions'
import NewTransactionHoc from './TransactionHoc'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
// import { DEFAULT_GAS_PRICE } from 'services/smart-contracts/constants'
import { WalletAction } from 'components/dashboard/forms/FormsCommon'
import {
	PropRow,
	ContentBox,
	ContentBody,
	ContentStickyTop,
	FullContentSpinner,
} from 'components/common/dialog/content'
import Helper from 'helpers/miscHelpers'
import { withStyles } from '@material-ui/core/styles'
import { styles } from './styles'
import {
	IdentityWithdrawPreview,
	SetPrivilegePreview,
	IdentityWithdrawAnyPreview,
} from './previews'

class TransactionPreview extends Component {
	constructor(props, context) {
		super(props, context)

		this.state = {
			gas: null,
			fees: null,
			errors: [],
		}
	}

	componentDidMount() {
		const {
			getFeesFn,
			actions,
			handleChange,
			identityAvailable,
			transaction,
			txId,
			t,
			account,
		} = this.props
		if (getFeesFn && Object.keys(transaction).length) {
			actions.updateSpinner(txId, true)
			getFeesFn({ account, transaction })
				.then(fees => {
					handleChange('fees', fees)
					this.setState({ fees: fees })
					actions.updateSpinner(txId, false)

					if (parseFloat(fees.fees || 0) > parseFloat(identityAvailable)) {
						handleChange('errors', [
							t('INSUFFICIENT_BALANCE_FOR_FEES', {
								args: [identityAvailable, 'SAI', fees.fees, 'SAI'],
							}),
						])
					}
				})
				.catch(err => {
					console.log(err)
					actions.updateSpinner(txId, false)
					handleChange('errors', [Helper.getErrMsg(err)])
				})
		}
	}

	render() {
		const {
			transaction = {},
			t,
			classes,
			account,
			previewWarnMsgs,
			spinner,
			stepsId,
		} = this.props
		const errors = transaction.errors || []
		const {
			withdrawTo,
			withdrawAmount,
			setAddr,
			privLevel,
			tokenAddress,
			fees = {},
		} = transaction
		return (
			<div>
				{spinner ? (
					<FullContentSpinner />
				) : (
					<ContentBox>
						{transaction.waitingForWalletAction ? (
							<ContentStickyTop>
								<WalletAction t={t} authType={account.wallet.authType} />
							</ContentStickyTop>
						) : null}
						<ContentBody>
							{errors.length
								? errors.map((err, index) => (
										<PropRow
											key={index}
											classNameLeft={classes.error}
											classNameRight={classes.error}
											left={<ErrorIcon />}
											right={err}
										/>
								  ))
								: null}

							{previewWarnMsgs
								? previewWarnMsgs.map((msg, index) => (
										<PropRow
											key={index}
											classNameLeft={classes.warning}
											classNameRight={classes.warning}
											left={<WarningIcon />}
											right={t(msg.msg, { args: msg.args })}
										/>
								  ))
								: null}

							{stepsId === 'withdrawFromIdentity' && (
								<IdentityWithdrawPreview
									t={t}
									withdrawTo={withdrawTo}
									classes={classes}
									fees={fees}
									withdrawAmount={withdrawAmount}
								/>
							)}

							{stepsId === 'setIdentityPrivilege' && (
								<SetPrivilegePreview
									t={t}
									setAddr={setAddr}
									classes={classes}
									fees={fees}
									privLevel={privLevel}
								/>
							)}

							{stepsId === 'withdrawAnyFromIdentity' && (
								<IdentityWithdrawAnyPreview
									t={t}
									withdrawTo={withdrawTo}
									classes={classes}
									fees={fees}
									withdrawAmount={withdrawAmount}
									tokenAddress={tokenAddress}
								/>
							)}
						</ContentBody>
					</ContentBox>
				)}
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
	estimateGasFn: PropTypes.func,
}

function mapStateToProps(state, props) {
	const persist = state.persist
	const memory = state.memory
	const txId = props.stepsId
	return {
		transaction: memory.newTransactions[txId] || {},
		txId: txId,
		spinner: memory.spinners[txId],
		account: persist.account,
	}
}

function mapDispatchToProps(dispatch) {
	return {
		actions: bindActionCreators(actions, dispatch),
	}
}

const TransactionPreviewForm = NewTransactionHoc(TransactionPreview)
export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withStyles(styles)(TransactionPreviewForm))
