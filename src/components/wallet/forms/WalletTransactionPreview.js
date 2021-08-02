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
import { DiversifyPreview, WithdrawPreview, TradePreview } from './previews'
import {
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
	const spinner = useSelector(state => selectSpinnerById(state, stepsId))
	const {
		waitingForWalletAction,
		feesData = {},
		errors = [],
		withdrawTo,
	} = useSelector(state => selectNewTransactionById(state, txId))
	const [networkCongested, setNetworkCongested] = useState(false)
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)
	const { totalFeesFormatted, feeTokenSymbol } = feesData

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

						{stepsId === 'walletSwapForm' && (
							<TradePreview assetsData={assetsData} feesData={feesData} />
						)}

						{stepsId === 'walletDiversifyForm' && (
							<DiversifyPreview assetsData={assetsData} feesData={feesData} />
						)}

						{stepsId.includes('walletWithdraw-') && (
							<WithdrawPreview
								withdrawTo={withdrawTo}
								symbol={feeTokenSymbol}
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
										<Box
											display='flex'
											flexDirection='row'
											justify='center'
											alignItems='center'
										>
											<Box>
												{t('FEES_BREAKDOWN_ADVANCED_LABEL', {
													args: [totalFeesFormatted, feeTokenSymbol],
												})}
											</Box>
											<Box>
												<Box
													display='flex'
													flexDirection='row'
													justify='center'
													alignItems='center'
												>
													<Tooltip
														style={{ fontSize: '1em', marginLeft: '0.5em' }}
														title={t('TOOLTIP_EXPLAIN_WALLET_TRANSACTION_FEE', {
															args: [feeTokenSymbol],
														})}
														interactive
													>
														<HelpIcon color={'primary'} />
													</Tooltip>
												</Box>
											</Box>
										</Box>
									</Typography>
								</AccordionSummary>
								<List
									disablePadding
									dense
									subheader={
										<ListSubheader component='div'>
											{t('BD_TOTAL_FEE', {
												args: [totalFeesFormatted, feeTokenSymbol],
											})}
										</ListSubheader>
									}
								>
									{!!feesData.hasDeployTx && (
										<ListItem>
											<ListItemText primary={t('FEE_HAS_DEPLOY_FEE_INFO')} />
										</ListItem>
									)}
									<ListItem>
										<ListItemText
											secondary={t('FEE_DATA_TXNS_COUNT')}
											primary={feesData.txnsCount}
										/>
									</ListItem>
									<ListItem>
										<ListItemText
											secondary={t('FEE_DATA_TXNS_OPERATIONS_COUNT')}
											primary={feesData.calculatedOperationsCount}
										/>
									</ListItem>
									<ListItem>
										<ListItemText
											secondary={t('FEE_DATA_TXNS_TOTAOL_GAS_LIMIT')}
											primary={feesData.totalEstimatedGasLimitFormatted}
										/>
									</ListItem>
									<ListItem>
										<ListItemText
											secondary={t('FEE_DATA_CALCULATED_GAS_PRICE')}
											primary={feesData.calculatedGasPriceGWEI + ' Gwei'}
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
