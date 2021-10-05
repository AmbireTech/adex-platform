import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { makeStyles } from '@material-ui/core/styles'
import { alpha } from '@material-ui/core/styles/colorManipulator'
import {
	TextField,
	Box,
	Avatar,
	Typography,
	IconButton,
	Paper,
	Chip,
} from '@material-ui/core'
import {
	AddSharp as AddIcon,
	CloseSharp as CloseIcon,
} from '@material-ui/icons'
import { InputLoading } from 'components/common/spinners/'
import {
	ContentBox,
	ContentBody,
	FullContentMessage,
} from 'components/common/dialog/content'
import {
	t,
	selectValidationsById,
	selectNewTransactionById,
	selectSpinnerById,
	selectWeb3SyncSpinnerByValidateId,
	selectAccountStatsFormatted,
	// selectAccountStatsRaw,
	selectMainCurrency,
	selectWithdrawAssetsFromSources,
	// selectMainCurrency,
} from 'selectors'
import { execute, updateNewTransaction } from 'actions'
import { Alert } from '@material-ui/lab'
import Dropdown from 'components/common/dropdown'
import { AmountWithCurrency } from 'components/common/amount'
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
			marginBottom: theme.spacing(2),
			marginTop: theme.spacing(0.5),
		},
		addBtn: {
			backgroundColor: theme.palette.primary.main,
			color: theme.palette.primary.contrastText,
			'&:hover': {
				backgroundColor: alpha(theme.palette.primary.main, 0.69),
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

const useStyles = makeStyles(styles)

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
	// index,
	address,
	amount,
	assetsData,
	// symbol,
	// name,
	onChange,
	feeTokenAddr,
	onFeeCheckboxChange,
	errors = {},
}) => {
	const classes = useStyles()

	const withdrawAssetData = assetsData[address] || {}
	const { name, symbol, balance, decimals } = withdrawAssetData
	const assetErrors = Object.keys(errors).filter(x => x.includes(symbol))
	const hasErrors = assetErrors.some(x => !!errors[x].dirty)

	return (
		<Paper elevation={0}>
			<Box p={1}>
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
						<Box flexGrow='100'>
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
								color='default'
							/>
						</Box>
						<Box display='inline'>
							<Typography variant='body1'>
								{t('BALANCE_SHORT')}
								<AmountWithCurrency
									amount={balance}
									mainFontVariant='body1'
									decimalsFontVariant='caption'
									toFixed={Math.max(4, Math.floor(decimals / 2))}
								/>
							</Typography>
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
							onChange({
								address,
								amount: safeNumberValue((ev.target.value || '').trim(), amount),
							})
						}
						// error={errAmount && !!errAmount.dirty}
						FormHelperTextProps={{
							margin: 'dense',
							style: { marginLeft: 0, marginRight: 0 },
						}}
						error={hasErrors}
						helperText={
							<Box>
								<Box
									mt={0.25}
									display='flex'
									flexDirection='row'
									alignItems='flex-start'
									justifyContent='space-between'
								>
									<Box>
										{[25, 50, 75, 100].map(percent => (
											<Box
												display='inline-block'
												key={percent.toString()}
												mr={0.25}
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
									<Box>
										<Chip
											variant={
												feeTokenAddr === address ? undefined : 'outlined'
											}
											color={feeTokenAddr === address ? 'secondary' : 'default'}
											clickable
											size='small'
											onClick={() => {
												onFeeCheckboxChange(address)
											}}
											label={
												feeTokenAddr === address
													? t('SELECTED_FOR_FEES')
													: t('SELECT_THIS_FOR_FEES')
											}
										/>
									</Box>
								</Box>
								<Box>
									{hasErrors &&
										assetErrors.map(x => {
											const err = errors[x]
											return err && !!err.dirty ? err.errMsg : ''
										})}
								</Box>
							</Box>
						}
					/>
				</Box>
			</Box>
		</Paper>
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
		feeTokenAddr,
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
		// amountToWithdraw: errAmount,
		withdrawTo: errAddr,
		fees: errFees,
		...assetsErrors
	} = useSelector(state => selectValidationsById(state, validateId) || {})

	const onFeeCheckboxChange = address => {
		execute(
			updateNewTransaction({
				tx: stepsId,
				key: 'feeTokenAddr',
				value: address,
			})
		)
	}

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
			amount: updatedAmount.toString(),
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

		if (!feeTokenAddr) {
			onFeeCheckboxChange(address)
		}
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
							<Box key={address} mb={1}>
								<AssetSelector
									index={index}
									amount={amount}
									percent={percent}
									address={address}
									assetsData={assetsData}
									onChange={updateWithdraws}
									feeTokenAddr={feeTokenAddr}
									onFeeCheckboxChange={onFeeCheckboxChange}
									errors={assetsErrors}
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
