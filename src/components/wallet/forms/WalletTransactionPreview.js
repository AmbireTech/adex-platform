import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import PropTypes from 'prop-types'
import ErrorIcon from '@material-ui/icons/Error'
import WarningIcon from '@material-ui/icons/Warning'
import { Alert, AlertTitle } from '@material-ui/lab'
import Dropdown from 'components/common/dropdown'
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
	selectMainCurrency,
	selectBaseAssetsPrices,
	selectNetwork,
	selectFeeTokens,
	selectFeeTokensWithBalanceSource,
	// selectAssetsPrices, // TODO: use one of selectAssetsPrices/selectBaseAssetsPrices
} from 'selectors'
import { formatTokenAmount, formatCurrencyValue } from 'helpers/formatters'
import {
	execute,
	// checkNetworkCongestion,
	updateNewTransaction,
} from 'actions'

import { HelpSharp as HelpIcon } from '@material-ui/icons'
import { ExpandMoreSharp as ExpandMoreIcon } from '@material-ui/icons'
import { getMainCurrencyValue } from 'helpers/wallet'
import { isETHBasedToken } from 'services/adex-wallet'
const useStyles = makeStyles(styles)

// TODO: translate
const speedSource = [
	{
		value: 'slow',
		label: `slow`,
	},
	{
		value: 'medium',
		label: `medium`,
	},
	{
		value: 'fast',
		label: `fast`,
	},
]

function getFeeDataLabel({
	// feeInUSD,
	txSpeed,
	feeInFeeToken,
	feeToken,
	mainCurrency,
	prices,
}) {
	const floatAmount = formatTokenAmount(
		feeInFeeToken[txSpeed],
		feeToken.decimals,
		false,
		feeToken.decimals
	)
	const feeMainCurrencyValue = getMainCurrencyValue({
		asset: feeToken.symbol,
		floatAmount,
		prices,
		mainCurrency,
	})

	return `${formatCurrencyValue(
		mainCurrency,
		feeMainCurrencyValue
	)} (${floatAmount} ${feeToken.symbol})`
}

const TransactionSpeedSelect = ({
	// txId,
	feesData,
	txSpeed,
	mainCurrency,
	prices,
	onTxSpeedChange,
}) => {
	const {
		// feeInUSD,
		feeToken,
		feeInFeeToken,
	} = feesData
	return (
		<Dropdown
			required
			fullWidth
			size='small'
			variant='outlined'
			name='selectTxSpeed'
			label={t('SELECT_TX_SPEED')}
			onChange={onTxSpeedChange}
			source={speedSource}
			value={txSpeed}
			htmlId='select-tx-speed'
			// error={userSide && !!userSide.dirty}
			helperText={getFeeDataLabel({
				txSpeed,
				feeInFeeToken,
				feeToken,
				mainCurrency,
				prices,
			})}
		/>
	)
}

const TransactionFeeTokenSelect = ({
	// txId,
	// feesData,
	feeTokensSource,
	// mainCurrency,
	// prices,
	feeTokenAddr,
	onTxFeeTokenChange,
}) => {
	// const {
	// 	// feeInUSD,
	// 	feeToken,
	// 	feeInFeeToken,
	// } = feesData
	return (
		<Dropdown
			required
			fullWidth
			size='small'
			variant='outlined'
			name='selectTxFeeTokenAddr'
			label={t('SELECT_TX_FEE_TOKEN')}
			onChange={onTxFeeTokenChange}
			source={feeTokensSource}
			value={feeTokenAddr}
			htmlId='select-tx-fee-token'
			// error={userSide && !!userSide.dirty}
			// helperText={getFeeDataLabel({
			// 	txSpeed,
			// 	feeInFeeToken,
			// 	feeToken,
			// 	mainCurrency,
			// 	prices,
			// })}
		/>
	)
}

function TransactionPreview(props) {
	const classes = useStyles()
	const {
		previewWarnMsgs,
		stepsId,
		validateId,
		validationFn,
		stepsProps,
	} = props
	const txId = stepsId
	const account = useSelector(selectAccount)
	const spinner = useSelector(state => selectSpinnerById(state, stepsId))
	const { networkName } = selectNetwork()
	const {
		waitingForWalletAction,
		feesData = {},
		errors = [],
		withdrawTo,
		fromAsset,
		toAsset,
		txSpeed,
		feeTokenAddr,
	} = useSelector(state => selectNewTransactionById(state, txId))
	const [
		networkCongested,
		// setNetworkCongested
	] = useState(false)
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)
	const {
		feeInFeeTokenFormatted,
		feeToken,
		// feeTokenSymbol: dataFeeTokenSymbol,
	} = feesData
	const prices = useSelector(selectBaseAssetsPrices)
	const mainCurrency = useSelector(selectMainCurrency)
	const feeTokensSource = useSelector(selectFeeTokensWithBalanceSource)

	const formAssetAddr = fromAsset || feesData.spendTokenAddr

	// WETH specific
	const isFromETHToken = formAssetAddr
		? isETHBasedToken({
				address: formAssetAddr,
		  })
		: false
	const isToETHToken = toAsset ? isETHBasedToken({ address: toAsset }) : false
	// const { symbol } = assetsData[formAssetAddr] || {}

	const feeTokenSymbol = feeToken.symbol //isFromETHToken ? symbol : dataFeeTokenSymbol
	const totalFeesFormatted = feeInFeeTokenFormatted[txSpeed]

	const feesMainCurrencyValue = getMainCurrencyValue({
		asset: feeTokenSymbol,
		floatAmount: totalFeesFormatted,
		prices,
		mainCurrency,
	})

	const onTxSpeedChange = async value => {
		await execute(
			updateNewTransaction({
				tx: txId,
				key: 'txSpeed',
				value,
			})
		)

		if (validationFn) {
			validationFn({
				stepsId,
				validateId,
				dirty: true,
				stepsProps,
			})
		} else console.error('wallet tx preview - no validation fn provided')
	}

	const onTxFeeTokenChange = async value => {
		await execute(
			updateNewTransaction({
				tx: txId,
				key: 'feeTokenAddr',
				value,
			})
		)

		if (validationFn) {
			validationFn({
				stepsId,
				validateId,
				dirty: true,
				stepsProps,
			})
		} else
			console.error(
				'wallet tx preview fee token addr change - no validation fn provided'
			)
	}

	// useEffect(() => {
	// 	async function checkNetwork() {
	// 		const msg = await execute(checkNetworkCongestion())

	// 		if (msg) {
	// 			setNetworkCongested(msg)
	// 		}
	// 	}

	// 	checkNetwork()
	// }, [])

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

						<Box p={1}>
							<Box pb={1}>
								<TransactionSpeedSelect
									feesData={feesData}
									txSpeed={txSpeed}
									prices={prices}
									onTxSpeedChange={onTxSpeedChange}
									mainCurrency={mainCurrency}
								/>
							</Box>
							<Box pb={1}>
								<TransactionFeeTokenSelect
									feesData={feesData}
									feeTokenAddr={feeTokenAddr}
									feeTokensSource={feeTokensSource}
									prices={prices}
									onTxFeeTokenChange={onTxFeeTokenChange}
								/>
							</Box>
							{/* <Alert variant='filled' severity='info'>
								{t('WALLET_FEES_INFO', { args: [networkName] })}
							</Alert> */}
						</Box>

						{stepsId === 'walletSwapForm' && (
							<TradePreview
								{...{
									prices,
									mainCurrency,
									assetsData,
									feesData,
									isFromETHToken,
									isToETHToken,
									fromAsset,
									toAsset,
								}}
							/>
						)}

						{stepsId === 'walletDiversifyForm' && (
							<DiversifyPreview
								{...{ prices, mainCurrency, assetsData, feesData }}
							/>
						)}

						{stepsId.includes('walletWithdraw-') && (
							<WithdrawPreview
								{...{
									prices,
									mainCurrency,
									assetsData,
									feesData,
									withdrawTo,
									totalFeesFormatted,
									feeTokenSymbol,
									symbol: feeTokenSymbol,
								}}
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
												{t('WALLET_FEES_BREAKDOWN_ADVANCED_LABEL', {
													args: [
														networkName,
														feesMainCurrencyValue,
														mainCurrency.symbol,
														totalFeesFormatted,
														feeTokenSymbol,
													],
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
											primary={feesData.gasLimit}
										/>
									</ListItem>
									<ListItem>
										<ListItemText
											secondary={t('FEE_DATA_CALCULATED_GAS_PRICE')}
											primary={feesData.calculatedGasPriceGWEI + ' Gwei'}
										/>
									</ListItem>
									<ListItem>
										<Accordion variant='outlined'>
											<AccordionSummary
												expandIcon={<ExpandMoreIcon />}
												aria-controls='txns-data'
												id='txns-data'
											>
												<Typography>{t('TXNS_FULL_DATA')}</Typography>
											</AccordionSummary>
											<Box p={1} color='grey.contrastText' bgcolor='grey.main'>
												<pre>{JSON.stringify(feesData.txnsData, null, 2)}</pre>
											</Box>
										</Accordion>
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
