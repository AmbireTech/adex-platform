import React from 'react'
import {
	Box,
	List,
	ListItem,
	ListItemText,
	ListSubheader,
	ExpansionPanel,
	ExpansionPanelSummary,
	Typography,
} from '@material-ui/core'
import { ExpandMoreSharp as ExpandMoreIcon } from '@material-ui/icons'

import { PropRow } from 'components/common/dialog/content'
import { t } from 'selectors'

export const FeesBreakdown = ({ breakdownFormatted = {}, symbol }) => (
	<Box p={1}>
		<ExpansionPanel square={true} variant='outlined'>
			<ExpansionPanelSummary
				expandIcon={<ExpandMoreIcon />}
				aria-controls='fees-breakdown'
				id='fees-breakdown'
			>
				<Typography>{t('FEES_BREAKDOWN_ADVANCED')}</Typography>
			</ExpansionPanelSummary>
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
				{!!breakdownFormatted.deployFee && (
					<ListItem>
						<ListItemText
							primary={t('BD_DEPLOY_FEE', {
								args: [breakdownFormatted.deployFee, symbol],
							})}
						/>
					</ListItem>
				)}
				<ListItem>
					<ListItemText
						primary={t('BD_TXNS_FEE', {
							args: [
								breakdownFormatted.executeAction,
								breakdownFormatted.txnsFee,
								symbol,
							],
						})}
					/>
				</ListItem>
				{!!breakdownFormatted.sweepTxnsCount && (
					<ListItem>
						<ListItemText
							primary={t('BD_SWEEP_FEE', {
								args: [
									breakdownFormatted.sweepTxnsCount,
									breakdownFormatted.sweepTxnsFeeAmount,
									symbol,
								],
							})}
						/>
					</ListItem>
				)}
			</List>
		</ExpansionPanel>
	</Box>
)

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
