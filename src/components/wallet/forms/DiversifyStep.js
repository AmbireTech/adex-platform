import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { BigNumber } from 'ethers'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { Add as AddIcon } from '@material-ui/icons'
import {
	TextField,
	Button,
	Box,
	Grid,
	Paper,
	// InputAdornment,
	Typography,
	OutlinedInput,
	Fab,
	Slider,
	FormControl,
	InputAdornment,
	Divider,
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
	selectAccountStatsRaw,
} from 'selectors'
import {
	execute,
	updateNewTransaction,
	updateEstimatedTradeValue,
} from 'actions'
import { Alert } from '@material-ui/lab'
import Dropdown from 'components/common/dropdown'
import { formatTokenAmount } from 'helpers/formatters'

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
		labelImg: {
			maxHeight: theme.spacing(2),
			marginRight: theme.spacing(2),
		},
		shareInput: {
			marginLeft: theme.spacing(2),
			maxWidth: 77,
		},
		divider: {
			marginTop: theme.spacing(1),
			marginBottom: theme.spacing(2),
		},
	}
}

const sliderStyles = theme => {
	const color = ({ index = 0 }) =>
		theme.palette.chartColors.all[index % theme.palette.chartColors.all.length]

	const height = 8
	const borderRadius = height / 2

	return {
		track: {
			borderRadius,
			height,
		},
		root: {
			color,
			height,
			borderRadius,
		},
		rail: {
			height,
			borderRadius,
			color: theme.palette.common.black,
		},
		thumb: {
			marginTop: 0,
			height,
			width: height,
		},
	}
}

const useStyles = makeStyles(styles)
const useSliderStyles = makeStyles(sliderStyles)

const ZERO = BigNumber.from(0)

const AssetSelector = ({
	index,
	address,
	logoSrc,
	symbol,
	name,
	share,
	maxPercent,
	onChange,
}) => {
	const classes = useStyles()
	const sliderClasses = useSliderStyles({ index })

	return (
		<Box
			display='flex'
			flexDirection='row'
			alignItems='center'
			// justifyContent='space-between'
		>
			{' '}
			<Box flexGrow='1'>
				<Box
					display='flex'
					flexDirection='row'
					alignItems='center'
					justifyContent='space-between'
				>
					<Box display='flex' flexDirection='row' alignItems='center'>
						<img src={logoSrc} alt={name} className={classes.labelImg} />
						{name} ({symbol})
					</Box>
					<Box>avl</Box>
				</Box>
				<Box>
					<Slider
						defaultValue={0}
						// getAriaValueText={valuetext}
						aria-labelledby={`asset-${symbol}-share-slider`}
						step={5}
						marks={false}
						onChange={(ev, value) => onChange(address, value)}
						min={0}
						max={100}
						value={share}
						valueLabelDisplay='off'
						classes={sliderClasses}
					/>
				</Box>
			</Box>
			<Box>
				<FormControl
					className={classes.shareInput}
					variant='outlined'
					size='small'
				>
					<OutlinedInput
						id={`asset-${symbol}-share-input`}
						value={share}
						onChange={ev => onChange(address, ev.target.value)}
						endAdornment={<InputAdornment position='end'>%</InputAdornment>}
						labelWidth={0}
					/>
				</FormControl>
			</Box>
		</Box>
	)
}

const WalletSwapTokensStep = ({ stepsId, validateId } = {}) => {
	const classes = useStyles()
	// NOTE: RAW DATA - BNs - format in fields
	const [selectedPercent, setSelectedPercent] = useState(0)
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)
	const assetsFromSource = useSelector(selectTradableAssetsFromSources)
	const [selectedNewAsset, setNewSelectedAsset] = useState('')
	const mainCurrency = { id: 'USD', symbol: '$' } // TODO selector
	// const estimatingSpinner = useSelector(state =>
	// 	selectSpinnerById(state, validateId)
	// )

	const {
		formAsset = '',
		formAssetAmount,
		diversificationAssets = [],
	} = useSelector(state => selectNewTransactionById(state, stepsId))

	const availableAssetsSrc = [...assetsFromSource].filter(
		x => !diversificationAssets.some(y => y.address === x.value)
	)

	const selectedFromAsset = assetsData[formAsset] || {}

	const fromAssetUserBalance = selectedFromAsset
		? selectedFromAsset.balance
		: ZERO

	const sharesLeft =
		100 -
		diversificationAssets.reduce((left, asset) => left + (asset.share || 0), 0)

	// const spinner = useSelector(state => selectSpinnerById(state, validateId))
	const syncSpinner = useSelector(state =>
		selectWeb3SyncSpinnerByValidateId(state, validateId)
	)

	const {
		formAssetAmount: errFormAssetAmount,
		formAsset: errFormAsset,
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
				key: 'formAssetAmount',
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
		formAssetAmount,
		selectedFromAsset.symbol,
		mainCurrency.id,
		stepsId,
		validateId,
	])

	const updateDiversifications = (address, share) => {
		const updated = [...diversificationAssets]

		const otherAssetsShares = [...updated]
			.filter(x => x.address !== address)
			.reduce((otherTotal, asset) => otherTotal + asset.share, 0)

		const maxShareLeft = 100 - otherAssetsShares

		const toUpdateIndex = updated.findIndex(x => x.address === address)

		const newValue = {
			address,
			share: share > maxShareLeft ? maxShareLeft : share,
		}

		if (toUpdateIndex > -1) {
			updated[toUpdateIndex] = newValue
		} else {
			updated.push(newValue)
		}

		execute(
			updateNewTransaction({
				tx: stepsId,
				key: 'diversificationAssets',
				value: updated,
			})
		)
	}

	useEffect(() => {
		if (!formAsset) {
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'formAsset',
					value: assetsFromSource[0] ? assetsFromSource[0].value : '',
				})
			)
		}
		if (formAssetAmount === undefined) {
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'formAssetAmount',
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
											value={`${formAssetAmount}`}
											onChange={ev => {
												execute(
													updateNewTransaction({
														tx: stepsId,
														key: 'formAssetAmount',
														value: ev.target.value,
													})
												)
												setSelectedPercent(0)
											}}
											error={errFormAssetAmount && !!errFormAssetAmount.dirty}
											helperText={
												errFormAssetAmount && !!errFormAssetAmount.dirty
													? errFormAssetAmount.errMsg
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
													key: 'formAsset',
													value,
												})
											)
											execute(
												updateNewTransaction({
													tx: stepsId,
													key: 'formAssetAmount',
													value: '0',
												})
											)
											setSelectedPercent(0)
										}}
										source={assetsFromSource}
										value={formAsset + ''}
										// label={t('FROM_ASSET_LABEL')}
										htmlId='wallet-asset-from-dd'
										name='formAsset'
										error={errFormAsset && !!errFormAsset.dirty}
										helperText={
											errFormAsset && !!errFormAsset.dirty
												? errFormAsset.errMsg
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
									<Box mt={1} mb={2}>
										{[25, 50, 75, 100].map(percent => (
											<Box
												display='inline-block'
												key={percent.toString()}
												p={0.25}
											>
												<Button
													variant={
														selectedPercent === percent
															? 'contained'
															: 'outlined'
													}
													size='small'
													color='default'
													disabled={!selectedFromAsset}
													onClick={() => {
														setTradePercent(percent)
														setSelectedPercent(percent)
													}}
												>
													{percent}%
												</Button>
											</Box>
										))}
									</Box>
								</Grid>
								<Grid item xs={12}>
									{diversificationAssets.map(({ address, share }, index) => (
										<Box>
											<AssetSelector
												key={address}
												index={index}
												share={share}
												{...assetsData[address]}
												onChange={updateDiversifications}
											/>
											<Divider className={classes.divider} />
										</Box>
									))}
									<Box display='flex' flexDirection='row' alignItems='center'>
										<Dropdown
											fullWidth
											variant='outlined'
											onChange={value => {
												console.log('value', value)
												value && setNewSelectedAsset(value)
											}}
											source={availableAssetsSrc}
											value={selectedNewAsset}
											size='small'
											// label={t('FROM_ASSET_LABEL')}
											htmlId='wallet-asset-from-dd'
										/>
										<Fab
											size='small'
											color='primary'
											aria-label='add'
											onClick={() =>
												selectedNewAsset &&
												updateDiversifications(selectedNewAsset, 0) &&
												setNewSelectedAsset('')
											}
										>
											<AddIcon />
										</Fab>
									</Box>
								</Grid>
								<Grid item xs={12}>
									<Box mt={2}>
										<TextField
											label={t('SHARES_LEFT')}
											value={sharesLeft}
											InputProps={{
												readOnly: true,
											}}
											variant='outlined'
										/>
									</Box>
								</Grid>
							</Grid>
						</Box>

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
