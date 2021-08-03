import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { BigNumber } from 'ethers'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
import {
	AddSharp as AddIcon,
	StopSharp as StopIcon,
	CloseSharp as CloseIcon,
} from '@material-ui/icons'
import {
	TextField,
	Button,
	Box,
	Grid,
	Avatar,
	// InputAdornment,
	Typography,
	OutlinedInput,
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
	selectDiversifiableAssetsFromSources,
	selectAccountStatsRaw,
	selectMainCurrency,
} from 'selectors'
import { execute, updateNewTransaction } from 'actions'
import { Alert } from '@material-ui/lab'
import Dropdown from 'components/common/dropdown'
import { formatTokenAmount } from 'helpers/formatters'
import { diversificationPresets } from 'services/adex-wallet/diversifications'
import { IconButton } from '@material-ui/core'
import { getLogo } from 'services/adex-wallet'

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
		addBtn: {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.primary.contrastText,
			'&:hover': {
				backgroundColor: fade(theme.palette.primary.main, 0.69),
			},
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
			<Grid item xs={6} sm={5}>
				<Box position='relative' width='100%' height='100%' paddingTop='100%'>
					<Box
						className={classes.chartCore}
						display='flex'
						flexDirection='column'
						alignItems='center'
						justifyContent='center'
						position='absolute'
						width='70%'
						height='70%'
						bgcolor='background.paper'
						left='15%'
						top='15%'
						borderRadius='50%'
					>
						<svg
							width='98%'
							height='100%'
							viewBox='0 0 300 300'
							preserveAspectRatio='xMinYMid meet'
						>
							<text
								dominantBaseline='middle'
								textAnchor='middle'
								x='50%'
								y='50%'
								fontSize='40'
								fontWeight='bold'
								fill={theme.palette.text.primary}
							>
								{totalUsedValueMainCurrency}
							</text>
							<text
								dominantBaseline='middle'
								textAnchor='middle'
								x='50%'
								y='69%'
								fontSize='36'
								fontWeight='bold'
								fill={theme.palette.text.secondary}
							>
								{t('TOTAL')}
							</text>
						</svg>
					</Box>
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
				</Box>
			</Grid>
			<Grid item xs={6} sm={7}>
				<Box>
					{data.labels.map((label, index) => {
						return (
							<Box
								key={label + index}
								display='flex'
								flexDirection='row'
								alignItems='center'
								justifyContent='space-between'
								flexWrap='wrap'
							>
								<Box display='flex' flexDirection='row' alignItems='center'>
									<StopIcon
										style={{ color: chartColors[index % chartColors.length] }}
										fontSize='small'
									/>
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
						<Avatar
							src={getLogo(symbol)}
							alt={name}
							className={classes.labelImg}
						/>
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
			<Box mr={1}>
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
			<IconButton
				size='small'
				edge='end'
				onClick={() => onChange(address, null, null, true)}
			>
				<CloseIcon />
			</IconButton>
		</Box>
	)
}

const WalletSwapTokensStep = ({ stepsId, validateId } = {}) => {
	const classes = useStyles()
	// NOTE: RAW DATA - BNs - format in fields
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)
	const assetsFromSource = useSelector(selectDiversifiableAssetsFromSources)
	const [selectedNewAsset, setNewSelectedAsset] = useState('')
	const mainCurrency = useSelector(selectMainCurrency) // {id: 'USD', symbol: '$' }
	// const estimatingSpinner = useSelector(state =>
	// 	selectSpinnerById(state, validateId)
	// )

	const {
		fromAsset = '',
		diversificationAssets = [],
		fromAssetAmount = '',
	} = useSelector(state => selectNewTransactionById(state, stepsId))

	const availableAssetsSrc = [...assetsFromSource].filter(
		x => !diversificationAssets.some(y => y.address === x.value)
	)

	const selectedFromAsset = assetsData[fromAsset] || {}

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

	const totalUsedValueMainCurrency =
		mainCurrency.symbol +
		(selectedFromAsset.balance
			? selectedFromAsset.assetBalanceToMainCurrenciesValues[mainCurrency.id] *
			  (sharesUsed / 100)
			: 0
		).toFixed(2)

	const { fromAsset: errFromAsset, fees: errFees } = useSelector(
		state => selectValidationsById(state, validateId) || {}
	)

	const updateDiversifications = (address, share, presets, remove) => {
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

			if (toUpdateIndex > -1 && remove) {
				updated.splice(toUpdateIndex, 1)
			} else if (toUpdateIndex > -1) {
				updated[toUpdateIndex] = newValue
			} else if (!remove) {
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
		if (!fromAsset) {
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'fromAsset',
					value: assetsFromSource[0] ? assetsFromSource[0].value : '',
				})
			)
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		if (!!fromAsset) {
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'fromAssetAmount',
					value: formatTokenAmount(
						BigNumber.from(fromAssetUserBalance), //.div(5),
						selectedFromAsset.decimals
					),
				})
			)
			execute(
				updateNewTransaction({
					tx: stepsId,
					key: 'fromAsset',
					value: fromAsset,
				})
			)
		}
	}, [fromAsset, fromAssetUserBalance, selectedFromAsset.decimals, stepsId])

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
						<Box mb={2}>
							<Grid container spacing={0}>
								<Grid item xs={8}>
									<Box>
										<TextField
											// disabled={spinner}
											variant='outlined'
											type='text'
											fullWidth
											required
											size='small'
											label={t('AVAILABLE')}
											name='fromAssetUserBalance'
											// value={formatTokenAmount(
											// 	BigNumber.from(fromAssetUserBalance).div(5),
											// 	selectedFromAsset.decimals
											// )}
											// readOnly
											value={fromAssetAmount || '0'}
											onChange={ev => {
												execute(
													updateNewTransaction({
														tx: stepsId,
														key: 'fromAssetAmount',
														value: ev.target.value,
													})
												)
											}}
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
										size='small'
										// required
										onChange={value => {
											execute(
												updateNewTransaction({
													tx: stepsId,
													key: 'fromAsset',
													value,
												})
											)
										}}
										source={assetsFromSource}
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
									<Box my={1}>
										<SelectedDoughnut
											diversificationAssets={diversificationAssets}
											assetsData={assetsData}
											sharesLeft={sharesLeft}
											totalUsedValueMainCurrency={totalUsedValueMainCurrency}
										/>
									</Box>
								</Grid>
								<Grid item xs={12}>
									<Box
										display='flex'
										flexDirection='row'
										justifyContent='flex-end'
										alignItems='center'
										flexWrap='wrap'
										mb={2}
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
											<IconButton
												className={classes.addBtn}
												size='small'
												edge='end'
												aria-label='add'
												onClick={() => {
													if (selectedNewAsset) {
														updateDiversifications(selectedNewAsset, 0)
														setNewSelectedAsset('')
													}
												}}
											>
												<AddIcon />
											</IconButton>
										</Box>
									)}
								</Grid>
								<Grid item xs={12}>
									<Box
										mt={4}
										display='flex'
										flexDirection='row'
										justifyContent='space-between'
									>
										<Box fontSize='h6.fontSize' color='primary.main'>
											{t('DIVERSIFY_TOTAL_WARNING')}
										</Box>
										<Box
											fontSize='h6.fontSize'
											dangerouslySetInnerHTML={{
												__html: t('SHARES_LEFT', { args: [sharesLeft] }),
											}}
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
