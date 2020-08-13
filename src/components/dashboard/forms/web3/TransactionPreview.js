import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
import { Alert, AlertTitle } from '@material-ui/lab'
import { Box } from '@material-ui/core'
import {
	WalletAction,
	FeesBreakdown,
} from 'components/dashboard/forms/FormsCommon'
import {
	PropRow,
	ContentBox,
	ContentBody,
	ContentStickyTop,
	FullContentSpinner,
} from 'components/common/dialog/content'
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
import { execute, checkNetworkCongestion } from 'actions'

const useStyles = makeStyles(styles)

function TransactionPreview(props) {
	const classes = useStyles()
	const { previewWarnMsgs, stepsId } = props
	const txId = stepsId
	const account = useSelector(selectAccount)
	const { address } = account.identity
	const { symbol } = useSelector(selectMainToken)
	const spinner = useSelector(state => selectSpinnerById(state, stepsId))
	const {
		withdrawTo,
		amountToWithdraw,
		waitingForWalletAction,
		setAddr,
		username,
		privLevel,
		tokenAddress,
		feesData = {},
		errors = [],
	} = useSelector(state => selectNewTransactionById(state, txId))
	const [networkCongested, setNetworkCongested] = useState(false)

	useEffect(() => {
		async function checkNetwork() {
			const msg = await execute(checkNetworkCongestion())

			if (msg) {
				setNetworkCongested(msg)
			}
		}

		checkNetwork()
	}, [])

	return (
		<div>
			{spinner ? (
				<FullContentSpinner />
			) : (
				<ContentBox>
					{waitingForWalletAction || networkCongested ? (
						<ContentStickyTop>
							{waitingForWalletAction && (
								<Box p={1}>
									<WalletAction t={t} authType={account.wallet.authType} />
								</Box>
							)}
							{networkCongested && (
								<Box p={1}>
									<Alert severity='warning' variant='filled' square>
										<AlertTitle>{t('NETWORK_WARNING')}</AlertTitle>
										{networkCongested}
									</Alert>
								</Box>
							)}
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
								amountToWithdraw={amountToWithdraw}
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
								amountToWithdraw={amountToWithdraw}
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
								username={username}
							/>
						)}
						<FeesBreakdown
							breakdownFormatted={feesData.breakdownFormatted}
							symbol={symbol}
						/>
					</ContentBody>
				</ContentBox>
			)}
		</div>
	)
}

TransactionPreview.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	previewMsgs: PropTypes.array,
}

export default TransactionPreview
