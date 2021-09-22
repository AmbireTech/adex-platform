import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { BigNumber } from 'ethers'
import { makeStyles } from '@material-ui/core/styles'
import { SwapVert } from '@material-ui/icons'
import {
	TextField,
	Chip,
	Box,
	Grid,
	Paper,
	// InputAdornment,
	Typography,
	OutlinedInput,
	IconButton,
	FormControl,
	FormGroup,
	FormControlLabel,
	Checkbox,
} from '@material-ui/core'
import { AmountWithCurrency } from 'components/common/amount'
// import { InputLoading } from 'components/common/spinners/'
import {
	ContentBox,
	ContentBody,
	FullContentMessage,
} from 'components/common/dialog/content'
import {
	t,
	selectValidationsById,
	selectNewTransactionById,
	// selectSpinnerById,
	selectWeb3SyncSpinnerByValidateId,
	selectTradableAssetsFromSources,
	selectTradableAssetsToSources,
	selectAccountStatsRaw,
	selectBaseAssetsPrices,
	selectSpinnerById,
	selectMainCurrency,
} from 'selectors'
import {
	execute,
	updateNewTransaction,
	updateEstimatedTradeValue,
} from 'actions'
import { Alert } from '@material-ui/lab'
import Dropdown from 'components/common/dropdown'
import { formatTokenAmount } from 'helpers/formatters'
import { getMainCurrencyValue } from 'helpers/wallet'
import { hasAAVEInterestToken } from 'services/smart-contracts/actions/walletCommon'

const styles = theme => {
	return {
		leftInput: {
			borderBottomRightRadius: 0,
			borderTopRightRadius: 0,
			borderRight: 0,
			borderRightWidth: '0 !important',
		},
		notchedOutlineLeft: {
			borderRightWidth: '0 !important',
		},
		rightInput: {
			borderBottomLeftRadius: 0,
			borderTopLeftRadius: 0,
			borderLeft: 0,
		},
		notchedOutlineRight: {
			borderLeftWidth: '0 !important',
		},
	}
}

const useStyles = makeStyles(styles)

const ZERO = BigNumber.from(0)

const DataRow = ({ left, right }) => (
	<Box
		display='flex'
		flexDirection='row'
		justifyContent='space-between'
		alignItems='center'
	>
		<Box>{left}</Box>
		<Box>{right}</Box>
	</Box>
)

const TradeData = ({
	router,
	minimumAmountOut,
	priceImpact,
	executionPrice,
	slippageTolerance,
	routeTokens = [],
}) => (
	<Paper>
		<Box p={2}>
			<DataRow left={t('SWAP_DATA_ROUTER')} right={router} />
			<DataRow left={t('SWAP_DATA_PATH')} right={routeTokens.join(' > ')} />
			<DataRow left={t('SWAP_DATA_PRICE_IMPACT')} right={priceImpact} />
			<DataRow left={t('SWAP_DATA_MIN_RECEIVED')} right={minimumAmountOut} />
			<DataRow
				left={t('SWAP_DATA_SLIPPAGE_TOLERANCE')}
				right={slippageTolerance}
			/>
			{/* <DataRow left={t('SWAP_DATA_EXECUTION_PRICE')} right={executionPrice} /> */}
		</Box>
	</Paper>
)

// const conversionRate = ({ fromAsset, toAsset, prices, mainCurrency }) => {
// 	const fromPrice = parseFloat((prices[fromAsset] || {})[mainCurrency] || 0)
// 	const toPrice = parseFloat((prices[toAsset] || {})[mainCurrency] || 0)

// 	if (!toPrice) {
// 		return null
// 	}

// 	return fromPrice / toPrice
// }

// const estimatedConversionValue = ({
// 	fromAsset,
// 	toAsset,
// 	fromAssetAmount,
// 	prices,
// 	mainCurrency,
// }) => {
// 	const rate = conversionRate({
// 		fromAsset,
// 		toAsset,
// 		prices,
// 		mainCurrency,
// 	})

// 	const value =
// 		rate && !!parseFloat(fromAssetAmount)
// 			? parseFloat(fromAssetAmount) * rate
// 			: null

// 	return value
// }

const WalletSwapTokensStep = ({ stepsId, validateId } = {}) => {
	const classes = useStyles()
	// NOTE: RAW DATA - BNs - format in fields
	const [selectedPercent, setSelectedPercent] = useState(0)
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)
	const prices = useSelector(selectBaseAssetsPrices)
	const mainCurrency = useSelector(selectMainCurrency)
	const assetsFromSource = useSelector(selectTradableAssetsFromSources)
	const assetsToSource = useSelector(selectTradableAssetsToSources)

	const estimatingSpinner = useSelector(state =>
		selectSpinnerById(state, validateId)
	)

	const {
		fromAsset = '',
		fromAssetAmount,
		toAssetAmount = '0.00',
		toAsset = '',
		tradeData,
		lendOutputToAAVE,
	} = useSelector(state => selectNewTransactionById(state, stepsId))

	const selectedFromAsset = assetsData[fromAsset] || {}
	const selectedToAsset = assetsData[toAsset] || {}
	const canLenndToAAVE = hasAAVEInterestToken({ underlyingAssetAddr: toAsset })

	const fromAssetUserBalance = selectedFromAsset
		? selectedFromAsset.totalAvailableMainAsset ||
		  selectedFromAsset.totalAvailable
		: ZERO

	const toAssetUserCurrentBalance = selectedToAsset
		? selectedToAsset.totalAvailable
		: ZERO

	// const spinner = useSelector(state => selectSpinnerById(state, validateId))
	const syncSpinner = useSelector(state =>
		selectWeb3SyncSpinnerByValidateId(state, validateId)
	)

	const selectedToAssetMainCurrencyValue = toAssetAmount
		? getMainCurrencyValue({
				asset: selectedToAsset.symbol,
				floatAmount: toAssetAmount,
				prices,
				mainCurrency: mainCurrency.id,
		  })
		: null

	const {
		fromAssetAmount: errFromAssetAmount,
		fromAsset: errFromAsset,
		toAsset: errToAsset,
		fees: errFees,
	} = useSelector(state => selectValidationsById(state, validateId) || {})

	const setTradePercent = percent => {
		const bnBalance = BigNumber.from(fromAssetUserBalance)
			.mul(percent)
			.div(100)
		const value = formatTokenAmount(bnBalance, selectedFromAsset.decimals)
		execute(
			updateNewTransaction({
				tx: stepsId,
				key: 'fromAssetAmount',
				value,
			})
		)
	}

	useEffect(() => {
		execute(
			updateEstimatedTradeValue({
				stepsId,
				validateId,
			})
		)
	}, [
		fromAssetAmount,
		selectedFromAsset.symbol,
		selectedToAsset.symbol,
		mainCurrency.id,
		stepsId,
		validateId,
	])

	const swapFromTo = () => {
		execute(
			updateNewTransaction({
				tx: stepsId,
				key: 'fromAsset',
				value: toAsset,
			})
		)
		execute(
			updateNewTransaction({
				tx: stepsId,
				key: 'toAsset',
				value: fromAsset,
			})
		)
		execute(
			updateNewTransaction({
				tx: stepsId,
				key: 'fromAssetAmount',
				value: toAssetAmount || '0',
			})
		)
		execute(
			updateNewTransaction({
				tx: stepsId,
				key: 'toAssetAmount',
				value: fromAssetAmount || '0',
			})
		)
		setSelectedPercent(0)
	}

	useEffect(() => {
		if (!fromAsset) {
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'fromAsset',
					value: assetsFromSource[0] ? assetsFromSource[0].value : '',
				})
			)
		}
		if (fromAssetAmount === undefined) {
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'fromAssetAmount',
					value: '0',
				})
			)
		}
		if (!toAsset) {
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'toAsset',
					value: assetsFromSource[1] ? assetsFromSource[1].value : '',
				})
			)
		}
		if (toAssetAmount === undefined) {
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'toAssetAmount',
					value: '0',
				})
			)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return (
		<ContentBox>
			{syncSpinner ? (
				<FullContentMessage
					msgs={[{ message: 'SYNC_DATA_MSG' }]}
					spinner={true}
				></FullContentMessage>
			) : (
				<ContentBody>
					<Box>
						<Paper elevation={0}>
							<Box p={2}>
								<Grid container spacing={0}>
									<Grid item xs={12}>
										<Box mb={2} display='flex' justifyContent='space-between'>
											<Typography variant='h5'>{t('FROM')}</Typography>
											<Box display='inline'>
												<Typography variant='body1'>
													{t('AVAILABLE')}
													<AmountWithCurrency
														amount={formatTokenAmount(
															fromAssetUserBalance,
															selectedFromAsset.decimals
														)}
														mainFontVariant='body1'
														decimalsFontVariant='caption'
													/>
												</Typography>
											</Box>
										</Box>
									</Grid>
									<Grid item xs={8}>
										<Box>
											<TextField
												// disabled={spinner}
												variant='outlined'
												type='text'
												fullWidth
												required
												label=''
												name='amountToWithdraw'
												value={`${fromAssetAmount}`}
												onChange={ev => {
													execute(
														updateNewTransaction({
															tx: stepsId,
															key: 'fromAssetAmount',
															value: ev.target.value,
														})
													)
													setSelectedPercent(0)
												}}
												error={errFromAssetAmount && !!errFromAssetAmount.dirty}
												helperText={
													errFromAssetAmount && !!errFromAssetAmount.dirty
														? errFromAssetAmount.errMsg
														: null
												}
												InputProps={{
													classes: {
														root: classes.leftInput,
														// notchedOutline: classes.notchedOutlineLeft,
													},
												}}
											/>
										</Box>
									</Grid>
									<Grid item xs={4}>
										<Dropdown
											fullWidth
											variant='outlined'
											// required
											onChange={value => {
												execute(
													updateNewTransaction({
														tx: stepsId,
														key: 'fromAsset',
														value,
													})
												)
												execute(
													updateNewTransaction({
														tx: stepsId,
														key: 'fromAssetAmount',
														value: '0',
													})
												)
												setSelectedPercent(0)
											}}
											source={assetsFromSource}
											disabledValues={{ [toAsset]: true }}
											value={fromAsset + ''}
											// label={t('FROM_ASSET_LABEL')}
											htmlId='wallet-asset-from-dd'
											name='fromAsset'
											error={errFromAsset && !!errFromAsset.dirty}
											helperText={
												errFromAsset && !!errFromAsset.dirty
													? errFromAsset.errMsg
													: // : t('WALLET_TRADE_FROM_ASSET')
													  ''
											}
											inputComponent={
												<OutlinedInput
													// label={t('FROM_ASSET_LABEL')}
													labelWidth={0}
													classes={{
														root: classes.rightInput,
														// notchedOutline: classes.notchedOutlineRight,
													}}
												/>
											}
										/>
									</Grid>
									<Grid item xs={12}>
										<Box mt={1}>
											{[25, 50, 75, 100].map(percent => (
												<Box
													display='inline-block'
													key={percent.toString()}
													p={0.25}
												>
													<Chip
														variant={
															selectedPercent === percent ? 'filled' : null
														}
														size='small'
														color='default'
														disabled={!selectedFromAsset}
														onClick={() => {
															setTradePercent(percent)
															setSelectedPercent(percent)
														}}
														label={`${percent}%`}
													/>
												</Box>
											))}
										</Box>
									</Grid>
								</Grid>
							</Box>
						</Paper>
						<Box
							my={1}
							display='flex'
							flexDirection='row'
							justifyContent='center'
						>
							<IconButton onClick={swapFromTo} color='secondary'>
								<SwapVert />
							</IconButton>
						</Box>
						<Paper elevation={0}>
							<Box p={2}>
								<Grid container spacing={0}>
									<Grid item xs={12}>
										<Box mb={2} display='flex' justifyContent='space-between'>
											<Typography variant='h5'>{t('TO')}</Typography>
											<Box display='inline'>
												<Typography variant='body1'>
													{t('CURRENT_BALANCE')}
													<AmountWithCurrency
														amount={formatTokenAmount(
															toAssetUserCurrentBalance,
															selectedToAsset.decimals
														)}
														mainFontVariant='body1'
														decimalsFontVariant='caption'
													/>
												</Typography>
											</Box>
										</Box>
									</Grid>
									<Grid item xs={8}>
										<TextField
											// disabled={spinner}
											variant='outlined'
											type='text'
											fullWidth
											// disabled
											label={
												<Box display='inline'>
													{t('TRADE_TO_ASSET_ESTIMATED_AMOUNT_LABEL')}
												</Box>
											}
											name='amountToWithdraw'
											value={`${toAssetAmount || 'N/A'}`}
											InputProps={{
												classes: {
													root: classes.leftInput,
													// notchedOutline: classes.notchedOutlineLeft,
												},
											}}
										/>
									</Grid>
									<Grid item xs={4}>
										<Dropdown
											fullWidth
											variant='outlined'
											// required
											onChange={value =>
												execute(
													updateNewTransaction({
														tx: stepsId,
														key: 'toAsset',
														value,
													})
												)
											}
											source={assetsToSource}
											disabledValues={{ [fromAsset]: true }}
											value={toAsset}
											// label={t('TO_ASSET_LABEL')}
											htmlId='wallet-asset-to-dd'
											name='fromAsset'
											error={errToAsset && !!errToAsset.dirty}
											helperText={
												errToAsset && !!errToAsset.dirty
													? errToAsset.errMsg
													: // : t('WALLET_TRADE_FROM_ASSET')
													  ''
											}
											inputComponent={
												<OutlinedInput
													// label={t('TO_ASSET_LABEL')}
													labelWidth={0}
													classes={{
														root: classes.rightInput,
														// notchedOutline: classes.notchedOutlineRight,
													}}
												/>
											}
										/>
									</Grid>
									{tradeData && !estimatingSpinner && (
										<Grid item xs={12}>
											<Box
												mt={1}
												display='flex'
												flexDirection='row'
												justifyContent='space-between'
											>
												<Box>
													<AmountWithCurrency
														amount={selectedToAssetMainCurrencyValue}
														unit={mainCurrency.symbol}
														unitPlace='left'
														mainFontVariant='body1'
														decimalsFontVariant='caption'
													/>
												</Box>

												<Box>
													1 {selectedToAsset.symbol} ={' '}
													{tradeData.executionPriceInverted}{' '}
													{selectedFromAsset.symbol}
												</Box>
											</Box>
										</Grid>
									)}
									{canLenndToAAVE && (
										<Grid item xs={12}>
											<Box mt={2}>
												<FormControl>
													<FormGroup row>
														<FormControlLabel
															control={
																<Checkbox
																	checked={!!lendOutputToAAVE}
																	onChange={ev => {
																		execute(
																			updateNewTransaction({
																				tx: stepsId,
																				key: 'lendOutputToAAVE',
																				value: ev.target.checked,
																			})
																		)
																	}}
																	value='lendOutputToAAVE'
																/>
															}
															label={t('WALLET_SWAP_LEND_TO_AAVE_INFO', {
																args: [
																	selectedToAsset.symbol || '-',
																	selectedToAsset.currentToAaveAPY || '-',
																],
															})}
														/>
													</FormGroup>
												</FormControl>
											</Box>
										</Grid>
									)}
								</Grid>
							</Box>
						</Paper>

						{tradeData && (
							<Box mt={2}>
								<TradeData {...tradeData} />
							</Box>
						)}

						{errFees && errFees.dirty && errFees.errMsg && (
							<Alert variant='filled' severity='error'>
								{errFees.errMsg}
							</Alert>
						)}
					</Box>
				</ContentBody>
			)}
		</ContentBox>
	)
}

WalletSwapTokensStep.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	validateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
}

export default WalletSwapTokensStep
