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
	amount,
	secondary,
}) => (
	<Box
		display='flex'
		flexDirection='row'
		alignItems='center'
		justifyContent='space-betweens'
	>
		<Box display='flex' flexDirection='row' alignItems='center'>
			<ListItemText
				className={classes.address}
				primary={
					<Box display='flex' flexDirection='row' alignItems='center'>
						<Avatar src={logoSrc} alt={name} className={classes.labelImg} />
						{name} ({symbol}): {amount}
					</Box>
				}
				secondary={
					<Box pl={5} component='span' display='block'>
						{secondary}
					</Box>
				}
			/>
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
						key={address}
						{...{
							address,
							logoSrc,
							name,
							classes,
							symbol,
							share,
							amount: amountOutMin,
							secondary: t('SHARE_INFO', { args: [share] }),
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
	const fromAssetData = assetsData[tradeData.fromAsset]

	// console.log('fromAssetData', fromAssetData)
	// console.log('feesData', feesData)

	const { logoSrc, name, symbol } = fromAssetData
	const { logoSrc: outLogoSrc, name: outName, symbol: outSymbol } = assetsData[
		tradeData.toAsset
	]
	return (
		<Box>
			<Box p={1}>
				<Alert variant='filled' severity='info'>
					{t('WALLET_FEES_INFO_SWAP')}
				</Alert>
			</Box>
			<PropRow
				key='fromAsset'
				left={t('SWAP_FROM')}
				right={
					<TokenRow
						{...{
							address: feesData.spendTokenAddr,
							logoSrc,
							name,
							classes,
							symbol,
							amount: feesData.totalAmountToSpendFormatted,
							secondary: t('AMOUNT_SWAP_INFO', {
								args: [
									feesData.totalFeesFormatted,
									feesData.feeTokenSymbol,
									feesData.mainActionAmountFormatted,
									symbol,
								],
							}),
						}}
					/>
				}
			/>
			<PropRow
				key='expectedOut'
				left={t('SWAP_TO')}
				right={
					<TokenRow
						{...{
							address: feesData.spendTokenAddr,
							logoSrc: outLogoSrc,
							name: outName,
							classes,
							symbol: outSymbol,
							amount: tradeData.expectedAmountOut,
							secondary: t('SWAP_ESTIMATED_INFO'),
						}}
					/>
				}
			/>
		</Box>
	)
}

export const WithdrawPreview = ({ withdrawTo, feesData, assetsData }) => {
	const classes = useStyles()
	const { symbol, name, logoSrc } = assetsData[feesData.spendTokenAddr]
	return (
		<Box>
			<Box p={1}>
				<Alert variant='filled' severity='info'>
					{t('WALLET_FEES_INFO_SWAP')}
				</Alert>
			</Box>

			<PropRow
				key='withdrawTo'
				left={t('withdrawTo', { isProp: true })}
				right={
					<ListItemText
						// disableTypography
						primary={(withdrawTo || '').toString()}
						secondary={t('WITHDRAW_ADDRESS_WARNING')}
						secondaryTypographyProps={{ color: 'primary' }}
					/>
				}
			/>
			<PropRow
				key='amountToWithdraw'
				left={t('amountToWithdraw', { isProp: true })}
				right={
					<TokenRow
						{...{
							address: feesData.spendTokenAddr,
							logoSrc,
							name,
							classes,
							symbol,
							amount: feesData.totalAmountToSpendFormatted,
							secondary: t('AMOUNT_WITHDRAW_INFO', {
								args: [
									feesData.totalFeesFormatted,
									feesData.feeTokenSymbol,
									feesData.mainActionAmountFormatted,
									symbol,
								],
							}),
						}}
					/>
				}
			/>
		</Box>
	)
}
