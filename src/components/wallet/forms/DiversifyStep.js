import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { BigNumber } from 'ethers'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { Add as AddIcon, Stop as StopIcon } from '@material-ui/icons'
import {
	TextField,
	Button,
	Box,
	Grid,
	Avatar,
	// InputAdornment,
	Typography,
	OutlinedInput,
	Fab,
	Slider,
	FormControl,
	InputAdornment,
	Divider,
} from '@material-ui/core'
import { Doughnut } from 'react-chartjs-2'
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
import { tokens } from 'services/adex-wallet/assets'

const diversificationPresets = [
	{
		label: 'DIV_PRESET_CONSERVATIVE',
		assets: [
			{
				address: tokens.USDT,
				share: 40,
			},
			{
				address: tokens.DAI,
				share: 30,
			},
			{
				address: tokens.WETH,
				share: 20,
			},
			{
				address: tokens.ADX,
				share: 10,
			},
		],
	},
	{
		label: 'DIV_PRESET_DEGEN',
		assets: [
			{
				address: tokens.WETH,
				share: 40,
			},
			{
				address: tokens.ADX,
				share: 20,
			},
			{
				address: tokens.UNI,
				share: 20,
			},
			{
				address: tokens.USDT,
				share: 20,
			},
		],
	},
	{
		label: 'DIV_PRESET_RISKY',
		assets: [
			{
				address: tokens.UNI,
				share: 50,
			},
			{
				address: tokens.ADX,
				share: 30,
			},
			{
				address: tokens.USDT,
				share: 20,
			},
		],
	},
]

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
			height: theme.spacing(3),
			width: theme.spacing(3),
			marginRight: theme.spacing(2),
			backgroundColor: theme.palette.common.white,
		},
		shareInput: {
			marginLeft: theme.spacing(2),
			maxWidth: 77,
		},
		divider: {
			marginBottom: theme.spacing(1),
			marginTop: theme.spacing(0.5),
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
			padding: `${theme.spacing(1)}px 0`,
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

const SelectedDoughnut = ({
	diversificationAssets,
	assetsData,
	sharesLeft = 0,
	totalUsedValueMainCurrency = 0,
}) => {
	const theme = useTheme()

	console.log('theme', theme)
	const classes = useStyles()

	const chartColors = [...theme.palette.chartColors.all]

	const { labels, shares } = diversificationAssets.reduce(
		(data, asset) => {
			data.labels.push(assetsData[asset.address].symbol)
			data.shares.push(asset.share)
			return data
		},
		{
			labels: [],
			shares: [],
			totalMainCurrencyValue: 0,
		}
	)

	if (sharesLeft > 0) {
		labels.unshift('UNALLOCATED')
		shares.unshift(sharesLeft)
		chartColors.unshift('#707070')
	}

	const data = {
		labels,
		datasets: [
			{
				backgroundColor: chartColors,
				hoverBackgroundColor: chartColors,
				borderWidth: 0,
				data: shares,
				label: t('ASSET_SHARE'),
			},
		],
	}

	return (
		<Grid container spacing={2} alignItems='center'>
			<Grid item xs={5}>
				<Box position='relative' width='100%' height='100%' paddingTop='100%'>
					<Box
						position='absolute'
						top={0}
						bottom={0}
						width='100%'
						height='100%'
					>
						<Doughnut
							width={120}
							height={120}
							data={data}
							options={{
								cutoutPercentage: 70,
								responsive: true,
								legend: {
									display: false,
								},
								title: {
									display: false,
								},
								animation: false,
								tooltips: {
									callbacks: {
										label: function(item, data) {
											return (
												data.labels[item.index] +
												': ' +
												data.datasets[item.datasetIndex].data[item.index]
											)
										},
									},
								},
							}}
							style={{
								position: 'absolute',
								top: 0,
								bottom: 0,
								width: '100%',
								height: '100%',
							}}
						/>
					</Box>
					<Box
						className={classes.chartCore}
						display='flex'
						flexDirection='column'
						alignItems='center'
						justifyContent='center'
						position='absolute'
						width='70%'
						height='70%'
						backgroundColor='background.paper'
						left='15%'
						top='15%'
						borderRadius='50%'
					>
						<Box>{totalUsedValueMainCurrency}</Box>
						<Box>{t('TOTAL')}</Box>
					</Box>{' '}
				</Box>
			</Grid>
			<Grid item xs={7}>
				<Box>
					{data.labels.map((label, index) => {
						return (
							<Box
								key={label + index}
								display='flex'
								flexDirection='row'
								alignItems='center'
								justifyContent='space-between'
							>
								<Box
									display='flex'
									flexDirection='row'
									//   alignItems='center'
								>
									<Box
										style={{ color: chartColors[index % chartColors.length] }}
									>
										<StopIcon color='inherit' fontSize='small' />
									</Box>
									<Box> {label} </Box>
								</Box>
								<Box color='text.primary' fontWeight='fontWeightBold'>
									{data.datasets[0].data[index]}%
								</Box>
							</Box>
						)
					})}
				</Box>
			</Grid>
		</Grid>
	)
}

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
						<Avatar src={logoSrc} alt={name} className={classes.labelImg} />
						<Box>
							{name} ({symbol})
						</Box>
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
						size='small'
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
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)
	const assetsFromSource = useSelector(selectTradableAssetsFromSources)
	const [selectedNewAsset, setNewSelectedAsset] = useState('')
	const mainCurrency = useSelector(selectMainCurrency) // { id: 'USD', symbol: '$' }
	// const estimatingSpinner = useSelector(state =>
	// 	selectSpinnerById(state, validateId)
	// )

	const { formAsset = '', diversificationAssets = [] } = useSelector(state =>
		selectNewTransactionById(state, stepsId)
	)

	const availableAssetsSrc = [...assetsFromSource].filter(
		x => !diversificationAssets.some(y => y.address === x.value)
	)

	const selectedFromAsset = assetsData[formAsset] || {}

	const fromAssetUserBalance = selectedFromAsset.balance
		? selectedFromAsset.balance
		: ZERO

	const sharesUsed = diversificationAssets.reduce(
		(left, asset) => left + (asset.share || 0),
		0
	)

	const sharesLeft = 100 - sharesUsed

	// const spinner = useSelector(state => selectSpinnerById(state, validateId))
	const syncSpinner = useSelector(state =>
		selectWeb3SyncSpinnerByValidateId(state, validateId)
	)

	const totalUsedValueMainCurrency = selectedFromAsset.balance
		? selectedFromAsset.assetToMainCurrenciesValues[mainCurrency.id] *
		  (sharesUsed / 100)
		: 0

	const { formAsset: errFormAsset, fees: errFees } = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	useEffect(() => {
		execute(
			updateEstimatedTradeValue({
				stepsId,
				validateId,
			})
		)
	}, [selectedFromAsset.symbol, mainCurrency.id, stepsId, validateId])

	const updateDiversifications = (address, share, presets) => {
		const updated = [...(presets || diversificationAssets)]

		if (!presets) {
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
								<Grid item xs={8}>
									<Box>
										<TextField
											// disabled={spinner}
											variant='outlined'
											type='text'
											fullWidth
											required
											label={t('AVAILABLE')}
											name='fromAssetUserBalance'
											value={formatTokenAmount(
												fromAssetUserBalance,
												selectedFromAsset.decimals
											)}
											readonly
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
									<SelectedDoughnut
										diversificationAssets={diversificationAssets}
										assetsData={assetsData}
										sharesLeft={sharesLeft}
										totalUsedValueMainCurrency={totalUsedValueMainCurrency}
									/>
								</Grid>
								<Grid item xs={12}>
									<Box
										display='flex'
										flexDirection='row'
										justifyContent='flex-end'
										alignItems='center'
										flexWrap='wrap'
									>
										<Typography variant='caption' element='div'>
											{t('PRESETS')}:
										</Typography>
										{diversificationPresets.map(x => (
											<Box key={x.label} m={0.5}>
												<Button
													size='small'
													variant='contained'
													onClick={() => {
														updateDiversifications(null, null, x.assets)
													}}
												>
													{t(x.label)}
												</Button>
											</Box>
										))}
									</Box>
								</Grid>
								<Grid item xs={12}>
									{diversificationAssets.map(({ address, share }, index) => (
										<Box key={address}>
											<AssetSelector
												index={index}
												share={share}
												{...assetsData[address]}
												onChange={updateDiversifications}
											/>
											<Divider className={classes.divider} />
										</Box>
									))}
									{availableAssetsSrc.length && (
										<Box
											display='flex'
											flexDirection='row'
											alignItems='center'
											justifyContent='stretch'
										>
											<Box width={1} mr={1}>
												<Dropdown
													fullWidth
													variant='standard'
													onChange={value => {
														value && setNewSelectedAsset(value)
													}}
													source={availableAssetsSrc}
													value={selectedNewAsset}
													size='small'
													label={
														selectedNewAsset
															? t('DIVERSIFY_ADD_NEW_ASSET')
															: availableAssetsSrc
																	.map(x => x.label)
																	.join(', ')
																	.substr(0, 20) + '...'
													}
													htmlId='diversify-new-asset-dd'
												/>
											</Box>
											<Fab
												size='small'
												color='primary'
												aria-label='add'
												onClick={() => {
													if (selectedNewAsset) {
														updateDiversifications(selectedNewAsset, 0)
														setNewSelectedAsset('')
													}
												}}
											>
												<AddIcon />
											</Fab>
										</Box>
									)}
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
