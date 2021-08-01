import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
import { Alert, AlertTitle } from '@material-ui/lab'
import {
	Box,
	List,
	ListItem,
	ListItemText,
	ListSubheader,
	Accordion,
	AccordionSummary,
	Typography,
	Tooltip,
	Grid,
} from '@material-ui/core'
import { WalletAction } from 'components/dashboard/forms/FormsCommon'
import {
	PropRow,
	ContentBox,
	ContentBody,
	ContentStickyTop,
	FullContentSpinner,
} from 'components/common/dialog/content'
import { styles } from 'components/dashboard/forms/web3/styles'
import { DiversifyPreview, WithdrawPreview } from './previews'
import {
	selectMainToken,
	t,
	selectSpinnerById,
	selectAccount,
	selectNewTransactionById,
	selectAccountStatsRaw,
} from 'selectors'
import { execute, checkNetworkCongestion } from 'actions'

import { HelpSharp as HelpIcon } from '@material-ui/icons'
import { ExpandMoreSharp as ExpandMoreIcon } from '@material-ui/icons'

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
		withdrawTo,
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
								assetsData={assetsData}
								tokensOutData={feesData.tokensOutData}
							/>
						)}

						{stepsId.includes('walletWithdraw-') && (
							<WithdrawPreview
								withdrawTo={withdrawTo}
								symbol={symbol}
								feesData={feesData}
							/>
						)}

						<Box p={1}>
							<Accordion variant='outlined'>
								<AccordionSummary
									expandIcon={<ExpandMoreIcon />}
									aria-controls='fees-breakdown'
									id='fees-breakdown'
								>
									<Typography component='div'>
										<Grid
											container
											direction='row'
											justify='center'
											alignItems='center'
										>
											<Grid>
												{t('FEES_BREAKDOWN_ADVANCED_LABEL', {
													args: [
														feesData.totalFeesFormatted,
														feesData.feeTokenSymbol,
													],
												})}
											</Grid>
											<Grid>
												<Grid container justify='center' alignItems='center'>
													<Tooltip
														style={{ fontSize: '1em', marginLeft: '0.5em' }}
														title={t('TOOLTIP_EXPLAIN_TRANSACTION_FEE')}
														interactive
													>
														<HelpIcon color={'primary'} />
													</Tooltip>
												</Grid>
											</Grid>
										</Grid>
									</Typography>
								</AccordionSummary>
								<List
									disablePadding
									dense
									subheader={
										<ListSubheader component='div'>
											{t('BD_TOTAL_FEE', {
												args: [
													feesData.totalFeesFormatted,
													feesData.feeTokenSymbol,
												],
											})}
										</ListSubheader>
									}
								>
									{!!feesData.hasDeployTx && (
										<ListItem>
											<ListItemText primary={t('BD_HAS_DEPLOY_FEE_INFO')} />
										</ListItem>
									)}
									<ListItem>
										<ListItemText
											primary={t('FEE_DATA_INTERNAL_TXNS_COUNT')}
											secondary={feesData.txnsCount}
										/>
									</ListItem>
								</List>
							</Accordion>
						</Box>
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
