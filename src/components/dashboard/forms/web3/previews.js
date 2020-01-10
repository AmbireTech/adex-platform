import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import { PropRow } from 'components/common/dialog/content'
import { constants } from 'adex-models'

const privilegesNames = constants.valueToKey(constants.IdentityPrivilegeLevel)

export const IdentityWithdrawPreview = ({
	t,
	withdrawTo,
	classes,
	fees,
	withdrawAmount,
	symbol,
}) => (
	<div>
		<PropRow
			key='withdrawTo'
			left={t('withdrawTo', { isProp: true })}
			right={(withdrawTo || '').toString()}
		/>
		<PropRow
			key='withdrawAmount'
			left={t('withdrawAmount', { isProp: true })}
			right={
				<ListItemText
					className={classes.address}
					secondary={t('AMOUNT_WITHDRAW_INFO', {
						args: [fees.fees, symbol, fees.toGet, symbol],
					})}
					primary={`${withdrawAmount} ${symbol}`}
				/>
			}
		/>
	</div>
)

export const SetPrivilegePreview = ({
	t,
	setAddr,
	classes,
	fees,
	privLevel,
	symbol,
}) => (
	<div>
		<PropRow
			key='setAddr'
			left={t('setAddr', { isProp: true })}
			right={(setAddr || '').toString()}
		/>
		<PropRow
			key='privLevel'
			left={t('privLevel', { isProp: true })}
			right={
				<ListItemText
					className={classes.address}
					secondary={t('PRIV_LEVEL_INFO_AND_FEES', {
						args: [fees.fees, symbol],
					})}
					primary={privilegesNames[privLevel]}
				/>
			}
		/>
	</div>
)

export const IdentityWithdrawAnyPreview = ({
	t,
	withdrawTo,
	tokenAddress,
	classes,
	fees,
	withdrawAmount,
}) => (
	<div>
		<PropRow
			key='withdrawTo'
			left={t('withdrawTo', { isProp: true })}
			right={(withdrawTo || '').toString()}
		/>
		<PropRow
			key='tokenAddress'
			left={t('tokenAddress', { isProp: true })}
			right={(tokenAddress || '').toString()}
		/>
		<PropRow
			key='withdrawAmount'
			left={t('withdrawAmount', { isProp: true })}
			right={
				<ListItemText
					className={classes.address}
					secondary={t('AMOUNT_WITHDRAW_INFO', {
						args: [fees.fees, '', fees.toGet, ''],
					})}
					primary={withdrawAmount + ' '}
				/>
			}
		/>
	</div>
)
