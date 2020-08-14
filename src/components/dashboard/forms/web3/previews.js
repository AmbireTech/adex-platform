import React from 'react'
import { Box, ListItemText } from '@material-ui/core'

import { PropRow } from 'components/common/dialog/content'
import { t } from 'selectors'

export const IdentityWithdrawPreview = ({
	withdrawTo,
	classes,
	feesData,
	amountToWithdraw,
	symbol,
}) => (
	<Box>
		<PropRow
			key='withdrawTo'
			left={t('withdrawTo', { isProp: true })}
			right={(withdrawTo || '').toString()}
		/>
		<PropRow
			key='amountToWithdraw'
			left={t('amountToWithdraw', { isProp: true })}
			right={
				<ListItemText
					className={classes.address}
					secondary={t('AMOUNT_WITHDRAW_INFO', {
						args: [feesData.fees, symbol, feesData.toGet, symbol],
					})}
					primary={`${amountToWithdraw} ${symbol}`}
				/>
			}
		/>
	</Box>
)

export const SetPrivilegePreview = ({
	setAddr,
	classes,
	feesData,
	privLevel,
	symbol,
}) => (
	<Box>
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
	</Box>
)

export const SetENSPreview = ({
	username,
	address,
	classes,
	feesData,
	symbol,
}) => (
	<Box>
		<PropRow
			key='addr'
			left={t('ENS_ADDR_TO_BE_SET')}
			right={(address || '').toString()}
		/>
		<PropRow
			key='username'
			left={t('username', { isProp: true })}
			right={
				<ListItemText
					className={classes.address}
					secondary={t('ENS_INFO_AND_FEES', {
						args: [
							feesData.fees,
							symbol,
							`${username}.${process.env.REVERSE_REGISTRAR_PARENT}`,
						],
					})}
					primary={`${username}.${process.env.REVERSE_REGISTRAR_PARENT}`}
				/>
			}
		/>
	</Box>
)

export const IdentityWithdrawAnyPreview = ({
	withdrawTo,
	tokenAddress,
	classes,
	feesData,
	amountToWithdraw,
}) => (
	<Box>
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
			key='amountToWithdraw'
			left={t('amountToWithdraw', { isProp: true })}
			right={
				<ListItemText
					className={classes.address}
					secondary={t('AMOUNT_WITHDRAW_INFO', {
						args: [feesData.fees, '', feesData.toGet, ''],
					})}
					primary={amountToWithdraw + ' '}
				/>
			}
		/>
	</Box>
)
