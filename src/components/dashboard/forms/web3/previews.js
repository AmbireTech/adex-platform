import React from 'react'
import ListItemText from '@material-ui/core/ListItemText'
import { PropRow } from 'components/common/dialog/content'
import { constants } from 'adex-models'

const privilegesNames = constants.valueToKey(constants.IdentityPrivilegeLevel)

export const IdentityWithdrawPreview = ({
	t,
	withdrawTo,
	classes,
	feesData,
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
						args: [feesData.fees, symbol, feesData.toGet, symbol],
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
	feesData,
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
						args: [feesData.fees, symbol],
					})}
					primary={t(`PRIV_${privLevel}_LABEL`)}
				/>
			}
		/>
	</div>
)

export const SetENSPreview = ({
	t,
	setEns,
	address,
	classes,
	feesData,
	symbol,
}) => (
	<div>
		<PropRow
			key='addr'
			left={t('ENS_ADDR_TO_BE_SET')}
			right={(address || '').toString()}
		/>
		<PropRow
			key='setEns'
			left={t('setEns', { isProp: true })}
			right={
				<ListItemText
					className={classes.address}
					secondary={t('ENS_INFO_AND_FEES', {
						args: [
							feesData.fees,
							symbol,
							`${setEns}.${process.env.REVERSE_REGISTRAR_PARENT}`,
						],
					})}
					primary={`${setEns}.${process.env.REVERSE_REGISTRAR_PARENT}`}
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
	feesData,
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
						args: [feesData.fees, '', feesData.toGet, ''],
					})}
					primary={withdrawAmount + ' '}
				/>
			}
		/>
	</div>
)
