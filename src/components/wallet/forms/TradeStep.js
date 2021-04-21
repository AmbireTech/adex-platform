import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
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
} from 'selectors'
import { execute, updateNewTransaction } from 'actions'
import { Alert } from '@material-ui/lab'
import Dropdown from 'components/common/dropdown'

const WalletTradeStep = ({ stepsId, validateId } = {}) => {
	const assetsFromSource = useSelector(selectTradableAssetsFromSources)
	const assetsToSource = useSelector(selectTradableAssetsToSources)

	const { formAsset, formAssetAmount = '0', toAsset } = useSelector(state =>
		selectNewTransactionById(state, stepsId)
	)

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
