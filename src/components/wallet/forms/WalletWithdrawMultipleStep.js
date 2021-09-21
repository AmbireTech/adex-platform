import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { fade } from '@material-ui/core/styles/colorManipulator'
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
	IconButton,
	Chip,
} from '@material-ui/core'
import {
	AddSharp as AddIcon,
	StopSharp as StopIcon,
	CloseSharp as CloseIcon,
} from '@material-ui/icons'
import { BigNumber } from 'ethers'
import { InputLoading } from 'components/common/spinners/'
import {
	ContentBox,
	ContentBody,
	FullContentMessage,
} from 'components/common/dialog/content'
import OutlinedPropView from 'components/common/OutlinedPropView'
import {
	t,
	selectValidationsById,
	selectNewTransactionById,
	selectSpinnerById,
	selectWeb3SyncSpinnerByValidateId,
	selectAccountStatsFormatted,
	selectAccountStatsRaw,
	selectMainCurrency,
	selectWithdrawAssetsFromSources,
	// selectMainCurrency,
} from 'selectors'
import { execute, updateNewTransaction } from 'actions'
import { Alert } from '@material-ui/lab'
import Dropdown from 'components/common/dropdown'
import { getLogo, isETHBasedToken } from 'services/adex-wallet'
import { assets } from 'services/adex-wallet/assets-kovan'

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
			marginBottom: theme.spacing(2),
			marginTop: theme.spacing(0.5),
		},
		addBtn: {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.primary.contrastText,
			'&:hover': {
				backgroundColor: fade(theme.palette.primary.main, 0.69),
			},
		},
		selectIcon: {
			color: theme.palette.primary.main,
			width: '1.2em',
			height: '1.2em',
			top: `calc(50% - 0.6em)`,
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

const safeNumberValue = (value, stateValue) => {
	const numValue = Number(value)
	if (!value && value !== 0) {
		return ''
	} else if (isNaN(numValue)) {
		return Number(stateValue)
	} else {
		return numValue
	}
}

const AssetSelector = ({
	index,
	address,
	amount,
	assetsData,
	// symbol,
	// name,
	onChange,
}) => {
	const classes = useStyles()
	const sliderClasses = useSliderStyles({ index })

	const withdrawAssetData = assetsData[address] || {}
	const { name, symbol, balance } = withdrawAssetData

	return (
		<OutlinedPropView
			margin='dense'
			value={
				<Box>
					<Box
						display='flex'
						flexDirection='row'
						alignItems='flex-start'
						justifyContent='space-between'
						// flexWrap='wrap'
						flexGrow='1'
					>
						<Box
							display='flex'
							flexDirection='row'
							alignItems='center'
							justifyContent='space-between'
							flexWrap='wrap'
							flexGrow='1'
						>
							<Box m={0.25} flexGrow='100'>
								<Chip
									avatar={
										<Avatar
											src={getLogo(symbol)}
											alt={name}
											className={classes.labelImg}
										/>
									}
									label={`${name} (${symbol})`}
									size='small'
									color='primary'
								/>
							</Box>
							<Box
								m={0.25}
								display='flex'
								justifyContent='space-between'
								flexDirection='row'
								alignItems='center'
							>
								<Chip
									label={`${t('BAL')}: ${balance}`}
									size='small'
									variant='filled'
								/>
							</Box>
						</Box>
						<IconButton
							size='small'
							edge='end'
							onClick={() => onChange({ address, remove: true })}
						>
							<CloseIcon />
						</IconButton>
					</Box>
					<Box
						mt={1}
						display='flex'
						flexDirection='row'
						alignItems='flex-start'
						justifyContent='space-between'
					>
						<TextField
							// disabled={spinner}
							type='text'
							variant='outlined'
							fullWidth
							required
							size='small'
							label={t('PROP_WITHDRAWAMOUNT')}
							name='amountToWithdraw'
							value={amount || ''}
							onChange={ev =>
								onChange({ address, amount: (ev.target.value || '').trim() })
							}
							// error={errAmount && !!errAmount.dirty}
							helperText={
								<Box mt={0.25}>
									{[25, 50, 75, 100].map(percent => (
										<Box
											display='inline-block'
											key={percent.toString()}
											p={0.2}
										>
											<Chip
												// variant={selectedPercent === percent ? 'contained' : 'outlined'}
												variant='outlined'
												clickable
												size='small'
												color='default'
												// disabled={!selectedFromAsset}
												onClick={() => {
													// setTradePercent(percent)
													// setSelectedPercent(percent)
													onChange({
														address,
														percent: percent,
													})
												}}
												label={`${percent}%`}
											/>
										</Box>
									))}
								</Box>
							}
						/>
					</Box>
				</Box>
			}
		/>
	)
}

const WalletWithdrawStep = ({ stepsId, validateId, stepsProps = {} } = {}) => {
	const classes = useStyles()
	// const mainCurrency = useSelector(selectMainCurrency)
	// const { withdrawAsset } = stepsProps
	// NOTE: RAW DATA - BNs - format in fields
	const { assetsData = {} } = useSelector(selectAccountStatsFormatted)
	const assetsFromSource = useSelector(selectWithdrawAssetsFromSources)
	const [selectedNewAsset, setNewSelectedAsset] = useState('')
	const mainCurrency = useSelector(selectMainCurrency) // {id: 'USD', symbol: '$' }

	// const { assetsData = {} } = useSelector(selectAccountStatsFormatted)

	// const { symbol, balance } = assetsData[withdrawAsset] || {}

	const {
		// amountToWithdraw,
		withdrawTo,
		withdrawAssets = [],
		//   feesData = {} // TODO: min amount
	} = useSelector(state => selectNewTransactionById(state, stepsId))

	// const max = balance

	const availableAssetsSrc = [...assetsFromSource].filter(
		x => !withdrawAssets.some(y => y.address === x.value)
	)

	// const totalUsedValueMainCurrency =
	// 	mainCurrency.symbol +
	// 	(selectedFromAsset.balance
	// 		? selectedFromAsset.assetBalanceToMainCurrenciesValues[mainCurrency.id] *
	// 		  (sharesUsed / 100)
	// 		: 0
	// 	).toFixed(2)

	const spinner = useSelector(state => selectSpinnerById(state, validateId))
	const syncSpinner = useSelector(state =>
		selectWeb3SyncSpinnerByValidateId(state, validateId)
	)

	const {
		amountToWithdraw: errAmount,
		withdrawTo: errAddr,
		fees: errFees,
	} = useSelector(state => selectValidationsById(state, validateId) || {})

	const updateWithdraws = ({ address, percent, amount, remove }) => {
		const updated = [...withdrawAssets]

		const toUpdateIndex = updated.findIndex(x => x.address === address)
		let updatedAmount = 0
		let updatedPercent = 0

		const selectedAsset = assetsData[address]

		const { balance } = selectedAsset

		if (percent) {
			updatedPercent = percent
			updatedAmount = (balance * percent) / 100
		} else if (amount) {
			updatedAmount = amount
			percent = (amount / balance) * 100
		}

		const newValue = {
			address,
			percent: updatedPercent,
			amount: updatedAmount,
		}

		if (toUpdateIndex > -1 && remove) {
			updated.splice(toUpdateIndex, 1)
		} else if (toUpdateIndex > -1) {
			updated[toUpdateIndex] = newValue
		} else if (!remove) {
			updated.push(newValue)
		}

		execute(
			updateNewTransaction({
				tx: stepsId,
				key: 'withdrawAssets',
				value: updated,
			})
		)
	}

	return (
		<ContentBox>
			{syncSpinner ? (
				<FullContentMessage
					msgs={[{ message: 'SYNC_DATA_MSG' }]}
					spinner={true}
				></FullContentMessage>
			) : (
				<ContentBody>
					<Box mb={2}>
						<Alert variant='filled' severity='warning'>
							{t('WITHDRAW_ADDRESS_WARNING')}
						</Alert>
					</Box>
					<Box mb={2}>
						<TextField
							disabled={spinner}
							type='text'
							variant='outlined'
							required
							fullWidth
							label={t('WITHDRAW_TO')}
							name='withdrawTo'
							value={withdrawTo || ''}
							onChange={ev =>
								execute(
									updateNewTransaction({
										tx: stepsId,
										key: 'withdrawTo',
										value: (ev.target.value || '').trim(),
									})
								)
							}
							error={errAddr && !!errAddr.dirty}
							helperText={
								!spinner && errAddr && !!errAddr.dirty ? errAddr.errMsg : ''
							}
						/>
						{spinner && <InputLoading />}
					</Box>
					<Box mb={2}>
						{withdrawAssets.map(({ address, amount, percent }, index) => (
							<Box key={address}>
								<AssetSelector
									index={index}
									amount={amount}
									percent={percent}
									address={address}
									assetsData={assetsData}
									onChange={updateWithdraws}
								/>
							</Box>
						))}
						{!!availableAssetsSrc.length && (
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
										onChange={address => {
											if (address) {
												updateWithdraws({ address, percent: 0 })
												setNewSelectedAsset('')
											}
										}}
										source={availableAssetsSrc}
										value={selectedNewAsset}
										size='small'
										label={t('WITHDRAW_NEW_ASSET', {
											args: [
												availableAssetsSrc
													.map(x => x.label)
													.join(', ')
													.substr(0, 20) + '...',
											],
										})}
										htmlId='withdraw-new-asset-dd'
										// IconComponent={() => <AddIcon color='secondary' />}
										IconComponent={AddIcon}
										selectClasses={{
											icon: classes.selectIcon,
										}}
									/>
								</Box>
							</Box>
						)}
						{/* <TextField
							disabled={spinner}
							type='text'
							variant='outlined'
							fullWidth
							required
							label={t('PROP_WITHDRAWAMOUNT')}
							name='amountToWithdraw'
							value={amountToWithdraw || ''}
							onChange={ev =>
								execute(
									updateNewTransaction({
										tx: stepsId,
										key: 'amountToWithdraw',
										value: (ev.target.value || '').trim(),
									})
								)
							}
							error={errAmount && !!errAmount.dirty}
							helperText={
								<span>
									<Button
										size='small'
										onClick={() => {
											execute(
												updateNewTransaction({
													tx: stepsId,
													key: 'amountToWithdraw',
													value: max,
												})
											)
										}}
									>
										{t('MAX_AMOUNT_TO_WITHDRAW', {
											args: [max, symbol],
										})}
									</Button>
									<span>
										{errAmount && !!errAmount.dirty ? errAmount.errMsg : ''}
									</span>
								</span>
							}
						/> */}
					</Box>
					{errFees && errFees.dirty && errFees.errMsg && (
						<Alert variant='filled' severity='error'>
							{errFees.errMsg}
						</Alert>
					)}
				</ContentBody>
			)}
		</ContentBox>
	)
}

WalletWithdrawStep.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	validateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
}

export default WalletWithdrawStep
