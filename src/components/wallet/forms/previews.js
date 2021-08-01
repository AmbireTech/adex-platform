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

const TokenRow = ({
	address,
	logoSrc,
	name,
	classes,
	symbol,
	share,
	amount,
}) => (
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
			{share !== undefined && <Box>{`${share}% - `} </Box>}
			<Box>{amount}</Box>
		</Box>
	</Box>
)

const useStyles = makeStyles(styles)
export const DiversifyPreview = ({ feesData = {}, assetsData }) => {
	const classes = useStyles()
	const { tokensOutData = [] } = feesData.actionMeta || {}
	return (
		<Box>
			{tokensOutData.map(({ address, amountOutMin, share }) => {
				const { logoSrc, name, symbol } = assetsData[address]
				return (
					<TokenRow
						{...{
							address,
							logoSrc,
							name,
							classes,
							symbol,
							share,
							amount: amountOutMin,
						}}
					/>
				)
			})}
		</Box>
	)
}

export const TradePreview = ({
	withdrawTo,
	feesData,
	// symbol = 'xx',
	assetsData,
}) => {
	const classes = useStyles()

	const { tradeData = {} } = feesData.actionMeta || {}
	const fromAssetData = assetsData[tradeData.formAsset]

	// console.log('fromAssetData', fromAssetData)
	// console.log('feesData', feesData)

	const { logoSrc, name, symbol } = fromAssetData
	const { logoSrc: outLogoSrc, name: outName, symbol: outSymbol } = assetsData[
		tradeData.toAsset
	]
	return (
		<Box>
			<PropRow
				key='fromAsset'
				left={t('fromAsset', { isProp: true })}
				right={
					<TokenRow
						{...{
							address: feesData.spendTokenAddr,
							logoSrc,
							name,
							classes,
							symbol,
							amount: feesData.mainActionAmountFormatted,
						}}
					/>
				}
			/>
			<PropRow
				key='expectedOut'
				left={t('toAsset', { isProp: true })}
				right={
					<TokenRow
						{...{
							address: feesData.spendTokenAddr,
							logoSrc: outLogoSrc,
							name: outName,
							classes,
							symbol: outSymbol,
							amount: tradeData.expectedAmountOut,
						}}
					/>
				}
			/>
			<PropRow
				key='amountToWithdraw'
				left={t('amountToWithdraw', { isProp: true })}
				right={
					<ListItemText
						className={classes.address}
						secondary={t('AMOUNT_WITHDRAW_INFO', {
							args: [
								feesData.totalFeesFormatted,
								feesData.feeTokenSymbol,
								feesData.mainActionAmountFormatted,
								symbol,
							],
						})}
						primary={`${feesData.totalAmountToSpendFormatted} ${symbol}`}
					/>
				}
			/>
		</Box>
	)
}

export const WithdrawPreview = ({ withdrawTo, feesData, symbol = 'xx' }) => {
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
								feesData.totalFeesFormatted,
								feesData.feeTokenSymbol,
								feesData.mainActionAmountFormatted,
								symbol,
							],
						})}
						primary={`${feesData.totalAmountToSpendFormatted} ${symbol}`}
					/>
				}
			/>
		</Box>
	)
}
