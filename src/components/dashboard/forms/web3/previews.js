import React from 'react'
import { List, ListItem, ListItemText, ListSubheader } from '@material-ui/core'
import { PropRow } from 'components/common/dialog/content'
import { t } from 'selectors'

export const FeesBreakdown = ({
	breakdownFormatted = {},
	symbol,
	executeAction,
}) => (
	<div>
		<PropRow
			key='breakdownFormatted'
			left={t('breakdownFormatted', { isProp: true })}
			right={
				<List
					disablePadding
					dense
					subheader={
						<ListSubheader component='div'>
							{t('BD_TOTAL_FEE', {
								args: [breakdownFormatted.feeAmount, symbol],
							})}
						</ListSubheader>
					}
				>
					<ListItem>
						<ListItemText
							primary={t('BD_TXNS_FEE', {
								args: [executeAction, breakdownFormatted.txnsFee, symbol],
							})}
						/>
					</ListItem>
					{!!breakdownFormatted.routinesSweepTxCount && (
						<ListItem>
							<ListItemText
								primary={t('BD_SWEEP_FEE', {
									args: [
										breakdownFormatted.routinesSweepTxCount,
										breakdownFormatted.sweepRoutinesFeeAmount,
										symbol,
									],
								})}
							/>
						</ListItem>
					)}
				</List>
			}
		/>
	</div>
)

export const IdentityWithdrawPreview = ({
	withdrawTo,
	classes,
	feesData,
	amountToWithdraw,
	symbol,
}) => (
	<div>
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
	</div>
)

export const SetPrivilegePreview = ({
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
	username,
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
	</div>
)

export const IdentityWithdrawAnyPreview = ({
	withdrawTo,
	tokenAddress,
	classes,
	feesData,
	amountToWithdraw,
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
	</div>
)
