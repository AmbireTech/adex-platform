import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import NewTransactionHoc from './TransactionHoc'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
import { WalletAction } from 'components/dashboard/forms/FormsCommon'
import {
	PropRow,
	ContentBox,
	ContentBody,
	ContentStickyTop,
	FullContentSpinner,
} from 'components/common/dialog/content'
import Helper from 'helpers/miscHelpers'
import { styles } from './styles'
import {
	IdentityWithdrawPreview,
	SetPrivilegePreview,
	IdentityWithdrawAnyPreview,
} from './previews'
import {
	selectMainToken,
	t,
	selectSpinnerById,
	selectAccount,
	selectNewTransactionById,
} from 'selectors'
import { execute, updateSpinner } from 'actions'

const useStyles = makeStyles(styles)

function TransactionPreview(props) {
	const classes = useStyles()
	const {
		getFeesFn,
		handleChange,
		identityAvailable,
		previewWarnMsgs,
		stepsId,
	} = props

	const txId = stepsId
	const account = useSelector(selectAccount)
	const { symbol } = useSelector(selectMainToken)
	const transaction = useSelector(state =>
		selectNewTransactionById(state, stepsId)
	)
	const spinner = useStyles(state => selectSpinnerById(state, stepsId))

	useEffect(() => {
		if (getFeesFn && Object.keys(transaction).length) {
			execute(updateSpinner(txId, true))
			getFeesFn({ account, transaction })
				.then(fees => {
					handleChange('fees', fees)
					this.setState({ fees: fees })
					execute(updateSpinner(txId, false))

					if (parseFloat(fees.fees || 0) > parseFloat(identityAvailable)) {
						handleChange('errors', [
							t('INSUFFICIENT_BALANCE_FOR_FEES', {
								args: [identityAvailable, symbol, fees.fees, symbol],
							}),
						])
					}
				})
				.catch(err => {
					console.log(err)
					execute(updateSpinner(txId, false))
					handleChange('errors', [Helper.getErrMsg(err)])
				})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const {
		withdrawTo,
		withdrawAmount,
		setAddr,
		privLevel,
		tokenAddress,
		fees = {},
		errors = [],
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
								symbol={symbol}
							/>
						)}

						{stepsId === 'setIdentityPrivilege' && (
							<SetPrivilegePreview
								t={t}
								setAddr={setAddr}
								classes={classes}
								fees={fees}
								privLevel={privLevel}
								symbol={symbol}
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
								symbol={symbol}
							/>
						)}
					</ContentBody>
				</ContentBox>
			)}
		</div>
	)
}

TransactionPreview.propTypes = {
	label: PropTypes.string,
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	previewMsgs: PropTypes.array,
}

const TransactionPreviewForm = NewTransactionHoc(TransactionPreview)
export default TransactionPreviewForm
