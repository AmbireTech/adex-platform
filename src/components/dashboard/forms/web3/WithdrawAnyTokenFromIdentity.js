import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
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
} from 'selectors'
import { execute, updateNewTransaction } from 'actions'
import { Alert } from '@material-ui/lab'

const WithdrawAnyTokenFromIdentity = ({ stepsId, validateId } = {}) => {
	const {
		amountToWithdraw,
		withdrawTo,
		tokenAddress,
		tokenDecimals,
	} = useSelector(state => selectNewTransactionById(state, stepsId))

	const spinner = useSelector(state => selectSpinnerById(state, validateId))
	const syncSpinner = useSelector(state =>
		selectWeb3SyncSpinnerByValidateId(state, validateId)
	)

	const {
		amountToWithdraw: errAmount,
		withdrawTo: errAddr,
		tokenAddress: errTokenAddress,
		tokenDecimals: errTokenDecimals,
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
					<TextField
						disabled={spinner}
						type='text'
						required
						fullWidth
						label={t('WITHDRAW_TOKEN_ADDRESS')}
						name='tokenAddress'
						value={tokenAddress || ''}
						onChange={ev =>
							execute(
								updateNewTransaction({
									tx: stepsId,
									key: 'tokenAddress',
									value: ev.target.value,
								})
							)
						}
						error={errTokenAddress && !!errTokenAddress.dirty}
						helperText={
							errTokenAddress && !!errTokenAddress.dirty
								? errTokenAddress.errMsg
								: ''
						}
					/>

					<TextField
						type='text'
						disabled={spinner}
						fullWidth
						required
						label={t('TOKENS_TO_WITHDRAW_DECIMALS')}
						name='tokenDecimals'
						value={tokenDecimals || ''}
						onChange={ev =>
							execute(
								updateNewTransaction({
									tx: stepsId,
									key: 'tokenDecimals',
									value: ev.target.value,
								})
							)
						}
						error={errTokenDecimals && !!errTokenDecimals.dirty}
						helperText={
							errTokenDecimals && !!errTokenDecimals.dirty
								? errTokenDecimals.errMsg
								: ''
						}
					/>
					<TextField
						disabled={spinner}
						type='text'
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
									value: ev.target.value,
								})
							)
						}
						error={errAddr && !!errAddr.dirty}
						helperText={errAddr && !!errAddr.dirty ? errAddr.errMsg : ''}
					/>
					{spinner ? <InputLoading /> : null}
					<TextField
						disabled={spinner}
						type='text'
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
									value: ev.target.value,
								})
							)
						}
						error={errAmount && !!errAmount.dirty}
						helperText={errAmount && !!errAmount.dirty ? errAmount.errMsg : ''}
					/>
					{errFees && errFees.dirty && errFees.errMsg && (
						<Alert variant='outlined' severity='error'>
							{errFees.errMsg}
						</Alert>
					)}
				</ContentBody>
			)}
		</ContentBox>
	)
}

WithdrawAnyTokenFromIdentity.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	validateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
}

export default WithdrawAnyTokenFromIdentity
