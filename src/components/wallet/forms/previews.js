import React from 'react'
import { Box, Avatar, ListItemText } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Alert } from '@material-ui/lab'
import { PropRow } from 'components/common/dialog/content'
import { t } from 'selectors'

const styles = theme => {
	return {
		labelImg: {
			height: theme.spacing(3),
			width: theme.spacing(3),
			marginRight: theme.spacing(2),
			backgroundColor: theme.palette.common.white,
		},
	}
}

const useStyles = makeStyles(styles)
export const DiversifyPreview = ({ tokensOutData, assetsData }) => {
	const classes = useStyles()
	return (
		<Box>
			{tokensOutData.map(({ address, amountOutMin, share }) => {
				const { logoSrc, name, symbol } = assetsData[address]
				return (
					<Box
						key={address}
						display='flex'
						flexDirection='row'
						alignItems='center'
						justifyContent='space-betweens'
					>
						<Box display='flex' flexDirection='row' alignItems='center'>
							<Avatar src={logoSrc} alt={name} className={classes.labelImg} />
							<Box>
								{name} ({symbol})
							</Box>
						</Box>
						<Box display='flex' flexDirection='row' alignItems='center'>
							<Box>{`${share}% - `} </Box>
							<Box>{amountOutMin}</Box>
						</Box>
					</Box>
				)
			})}
		</Box>
	)
}

export const WithdrawPreview = ({
	withdrawTo,
	feesData,
	amountToWithdraw,
	symbol = 'xx',
}) => {
	const classes = useStyles()
	return (
		<Box>
			<Box p={1}>
				<Alert variant='filled' severity='warning'>
					{t('WITHDRAW_ADDRESS_WARNING')}
				</Alert>
			</Box>
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
							args: [
								feesData.feesAmountFormatted,
								feesData.feeTokenSymbol,
								feesData.actualToSpendFormatted,
								symbol,
							],
						})}
						primary={`${feesData.totalToSpendFormatted} ${symbol}`}
					/>
				}
			/>
		</Box>
	)
}
