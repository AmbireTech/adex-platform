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
	Accordion,
	AccordionSummary,
	Typography,
	Tooltip,
} from '@material-ui/core'
import { WalletAction } from './FormsCommon'
import {
	PropRow,
	ContentBox,
	ContentBody,
	ContentStickyTop,
	FullContentSpinner,
} from 'components/common/dialog/content'
import { styles } from './styles'
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
	selectFeeTokensWithBalanceSource,
	// selectAssetsPrices, // TODO: use one of selectAssetsPrices/selectBaseAssetsPrices
} from 'selectors'
import { formatTokenAmount, formatCurrencyValue } from 'helpers/formatters'
import { execute, updateNewTransaction } from 'actions'

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
	// feesData,
	txSpeed,
	mainCurrency,
	prices,
	onTxSpeedChange,
	estimatedData,
	feeToken,
}) => {
	// const {
	// 	// feeInUSD,
	// 	// feeToken,
	// 	// estimatedData,
	// } = feesData
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
				feeInFeeToken: estimatedData.feeInFeeToken,
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
		// feesData = {},
		errors = [],
		// withdrawTo,
		// fromAsset,
		// toAsset,
		// txSpeed,
		feeTokenAddr,
		// bundle = {},
		txnsData,
		estimatedData,
		txnsMeta,
		bundle,
		actionName,
		feeToken,
		txSpeed,
		...txSpecific
	} = useSelector(state => selectNewTransactionById(state, txId))
	const [
		networkCongested,
		// setNetworkCongested
	] = useState(false)
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)

	const { spendTokenAddr } = txnsMeta

	const { txns, gasLimit } = bundle
	const prices = useSelector(selectBaseAssetsPrices)
	const mainCurrency = useSelector(selectMainCurrency)
	const feeTokensSource = useSelector(selectFeeTokensWithBalanceSource)

	const feeTokenSymbol = feeToken.symbol //isFromETHToken ? symbol : dataFeeTokenSymbol
	const totalFeesFormatted = estimatedData.feeInFeeTokenFormatted[txSpeed]

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
									estimatedData={estimatedData}
									feeToken={feeToken}
									txSpeed={txSpeed}
									prices={prices}
									onTxSpeedChange={onTxSpeedChange}
									mainCurrency={mainCurrency}
								/>
							</Box>
							<Box pb={1}>
								<TransactionFeeTokenSelect
									estimatedData={estimatedData}
									feeToken={feeToken.address}
									feeTokensSource={feeTokensSource}
									prices={prices}
									onTxFeeTokenChange={onTxFeeTokenChange}
								/>
							</Box>
							{/* <Alert variant='filled' severity='info'>
								{t('WALLET_FEES_INFO', { args: [networkName] })}
							</Alert> */}
						</Box>

						{/* {stepsId === 'walletSwapForm' && (
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
						)} */}

						{/* {stepsId === 'walletDiversifyForm' && (
							<DiversifyPreview
								{...{ prices, mainCurrency, assetsData, feesData }}
							/>
						)} */}

						{stepsId.includes('walletWithdraw-') && (
							<WithdrawPreview
								{...{
									prices,
									mainCurrency,
									assetsData,
									txnsMeta,
									estimatedData,
									feeTokenSymbol,
									symbol: feeTokenSymbol,
									...txSpecific,
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
										</Box>
									</Typography>
								</AccordionSummary>
								<List disablePadding dense>
									{!!estimatedData.hasDeployTx && (
										<ListItem>
											<ListItemText primary={t('FEE_HAS_DEPLOY_FEE_INFO')} />
										</ListItem>
									)}

									<ListItem>
										<ListItemText
											secondary={t('FEE_DATA_TXNS_TOTAOL_GAS_LIMIT')}
											primary={gasLimit}
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
												<pre>{JSON.stringify(txnsData, null, 2)}</pre>
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
