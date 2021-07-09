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
import { styles } from 'components/dashboard/forms/web3/styles'
import { DiversifyPreview } from './previews'

import {
	selectMainToken,
	t,
	selectSpinnerById,
	selectAccount,
	selectNewTransactionById,
	selectAccountStatsRaw,
} from 'selectors'
import { execute, checkNetworkCongestion } from 'actions'

const useStyles = makeStyles(styles)

function TransactionPreview(props) {
	const classes = useStyles()
	const { previewWarnMsgs, stepsId } = props
	const txId = stepsId
	const account = useSelector(selectAccount)
	const { symbol } = useSelector(selectMainToken)
	const spinner = useSelector(state => selectSpinnerById(state, stepsId))
	const {
		waitingForWalletAction,
		feesData = {},
		errors = [],
	} = useSelector(state => selectNewTransactionById(state, txId))
	const [networkCongested, setNetworkCongested] = useState(false)
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)

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

						{stepsId === 'walletDiversifyForm' && (
							<DiversifyPreview
								t={t}
								assetsData={assetsData}
								tokensOutData={feesData.tokensOutData}
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
