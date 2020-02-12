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
	SetENSPreview,
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
	const { address } = account.identity
	const { symbol } = useSelector(selectMainToken)
	const transaction = useSelector(state =>
		selectNewTransactionById(state, txId)
	)
	const spinner = useSelector(state => selectSpinnerById(state, txId))

	useEffect(() => {
		if (getFeesFn && Object.keys(transaction).length) {
			execute(updateSpinner(txId, true))
			getFeesFn({ account, transaction })
				.then(feesData => {
					handleChange('feesData', feesData)
					// if (feesData.toGet) {
					// 	handleChange('withdrawAmount', feesData.toGet)
					// }
					execute(updateSpinner(txId, false))

					if (parseFloat(feesData.fees || 0) > parseFloat(identityAvailable)) {
						handleChange('errors', [
							t('INSUFFICIENT_BALANCE_FOR_FEES', {
								args: [identityAvailable, symbol, feesData.fees, symbol],
							}),
						])
					}
				})
				.catch(err => {
					console.error(err)
					execute(updateSpinner(txId, false))
					handleChange('errors', [Helper.getErrMsg(err)])
				})
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const {
		withdrawTo,
		withdrawAmount,
		amountToWithdraw,
		setAddr,
		setEns,
		privLevel,
		tokenAddress,
		feesData = {},
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
								feesData={feesData}
								withdrawAmount={withdrawAmount}
								symbol={symbol}
							/>
						)}

						{stepsId === 'setIdentityPrivilege' && (
							<SetPrivilegePreview
								t={t}
								setAddr={setAddr}
								classes={classes}
								feesData={feesData}
								privLevel={privLevel}
								symbol={symbol}
							/>
						)}

						{stepsId === 'withdrawAnyFromIdentity' && (
							<IdentityWithdrawAnyPreview
								t={t}
								withdrawTo={withdrawTo}
								classes={classes}
								feesData={feesData}
								withdrawAmount={withdrawAmount || amountToWithdraw}
								tokenAddress={tokenAddress}
								symbol={symbol}
							/>
						)}

						{stepsId === 'setENS' && (
							<SetENSPreview
								t={t}
								setAddr={setAddr}
								classes={classes}
								feesData={feesData}
								address={address}
								symbol={symbol}
								setEns={setEns}
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
