import React from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { InputLoading } from 'components/common/spinners/'
import {
	t,
	selectValidationsById,
	selectNewTransactionById,
	selectMainToken,
	selectSpinnerById,
	selectAccountStatsFormatted,
} from 'selectors'
import { execute, updateNewTransaction } from 'actions'
import { Alert } from '@material-ui/lab'

const WithdrawFromIdentity = ({ stepsId, validateId } = {}) => {
	const { symbol } = useSelector(selectMainToken)
	const { availableIdentityBalanceMainToken: max } = useSelector(
		selectAccountStatsFormatted
	)

	const { amountToWithdraw, withdrawTo } = useSelector(state =>
		selectNewTransactionById(state, stepsId)
	)

	const spinner = useSelector(state => selectSpinnerById(state, validateId))

	const {
		amountToWithdraw: errAmount,
		withdrawTo: errAddr,
		fees: errFees,
	} = useSelector(state => selectValidationsById(state, validateId) || {})

	return (
		<div>
			<div>
				{t('EXCHANGE_CURRENT_MAIN_TOKEN_BALANCE_AVAILABLE_ON_IDENTITY', {
					args: [max, symbol],
				})}
			</div>
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
			{errFees && errFees.dirty && errFees.errMsg && (
				<Alert variant='outlined' severity='error'>
					{errFees.errMsg}
				</Alert>
			)}
		</div>
	)
}

WithdrawFromIdentity.propTypes = {
	stepsId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	validateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
		.isRequired,
}

export default WithdrawFromIdentity
