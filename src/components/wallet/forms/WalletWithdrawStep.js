import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { TextField, Button, Box } from '@material-ui/core'
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
	// selectMainCurrency,
} from 'selectors'
import { execute, updateNewTransaction } from 'actions'
import { Alert } from '@material-ui/lab'

const WalletWithdrawStep = ({ stepsId, validateId, stepsProps = {} } = {}) => {
	// const mainCurrency = useSelector(selectMainCurrency)
	const { withdrawAsset } = stepsProps
	const { assetsData = {} } = useSelector(selectAccountStatsFormatted)

	const { symbol, totalAvailable } = assetsData[withdrawAsset] || {}

	const { amountToWithdraw, withdrawTo, feesData = {} } = useSelector(state =>
		selectNewTransactionById(state, stepsId)
	)

	const { maxAvailableToSpendFormatted } = feesData

	const max = maxAvailableToSpendFormatted || totalAvailable

	const spinner = useSelector(state => selectSpinnerById(state, validateId))
	const syncSpinner = useSelector(state =>
		selectWeb3SyncSpinnerByValidateId(state, validateId)
	)

	const {
		amountToWithdraw: errAmount,
		withdrawTo: errAddr,
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
						<TextField
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
						/>
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
