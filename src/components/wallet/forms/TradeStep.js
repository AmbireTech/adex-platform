import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { BigNumber } from 'ethers'
import { TextField, Button, Box } from '@material-ui/core'
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
} from 'selectors'
import { execute, updateNewTransaction } from 'actions'
import { Alert } from '@material-ui/lab'
import Dropdown from 'components/common/dropdown'
import { formatTokenAmount } from 'helpers/formatters'

const ZERO = BigNumber.from(0)

const WalletTradeStep = ({ stepsId, validateId } = {}) => {
	const { assetsData = {} } = useSelector(selectAccountStatsRaw)
	const assetsFromSource = useSelector(selectTradableAssetsFromSources)
	const assetsToSource = useSelector(selectTradableAssetsToSources)

	const { formAsset, formAssetAmount = '0', toAsset } = useSelector(state =>
		selectNewTransactionById(state, stepsId)
	)

	const selectedFromAsset = assetsData[formAsset]

	const fromAssetUserBalance = selectedFromAsset
		? selectedFromAsset.balance
		: ZERO

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

	return (
		<ContentBox>
			{syncSpinner ? (
				<FullContentMessage
					msgs={[{ message: 'SYNC_DATA_MSG' }]}
					spinner={true}
				></FullContentMessage>
			) : (
				<ContentBody>
					<Dropdown
						fullWidth
						variant='standard'
						required
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
						label={t('PROP_FROMASSET')}
						htmlId='wallet-asset-from-dd'
						name='formAsset'
						error={errFormAsset && !!errFormAsset.dirty}
						helperText={
							errFormAsset && !!errFormAsset.dirty
								? errFormAsset.errMsg
								: t('WALLET_TRADE_FROM_ASSET')
						}
					/>
					<TextField
						// disabled={spinner}
						type='text'
						fullWidth
						required
						label={t('PROP_FROMASSETAMOUNT')}
						name='amountToWithdraw'
						value={formAssetAmount || ''}
						onChange={ev =>
							execute(
								updateNewTransaction({
									tx: stepsId,
									key: 'formAssetAmount',
									value: ev.target.value,
								})
							)
						}
						error={errFormAssetAmount && !!errFormAssetAmount.dirty}
						helperText={
							errFormAssetAmount && !!errFormAssetAmount.dirty
								? errFormAssetAmount.errMsg
								: ''
						}
					/>
					<Box>
						<Button
							disabled={!selectedFromAsset}
							onClick={() => setTradePercent(25)}
						>
							25%
						</Button>
						<Button
							disabled={!selectedFromAsset}
							onClick={() => setTradePercent(50)}
						>
							50%
						</Button>
						<Button
							disabled={!selectedFromAsset}
							onClick={() => setTradePercent(75)}
						>
							75%
						</Button>
						<Button
							disabled={!selectedFromAsset}
							onClick={() => setTradePercent(100)}
						>
							100%
						</Button>
					</Box>
					<Dropdown
						fullWidth
						variant='standard'
						required
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
						value={toAsset + ''}
						label={t('PROP_TOASSET')}
						htmlId='wallet-asset-to-dd'
						name='formAsset'
						error={errToAsset && !!errToAsset.dirty}
						helperText={
							errToAsset && !!errToAsset.dirty
								? errToAsset.errMsg
								: t('WALLET_TRADE_FROM_ASSET')
						}
					/>

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

WalletTradeStep.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	validateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
}

export default WalletTradeStep
