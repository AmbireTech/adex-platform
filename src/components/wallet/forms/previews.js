import React from 'react'
import { Box, Avatar, ListItemText } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { Alert } from '@material-ui/lab'
import { PropRow } from 'components/common/dialog/content'
import { t } from 'selectors'
import { getLogo } from 'services/adex-wallet'
import { getMainCurrencyValue } from 'helpers/wallet'

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
	// address,
	name,
	classes,
	symbol,
	amount,
	amountMainCurrency,
	mainCurrency,
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
						<Box mr={0.5}>
							<Avatar
								src={getLogo(symbol)}
								alt={name}
								className={classes.labelImg}
							/>
						</Box>
						<Box mr={0.5}>{name}</Box>
						<Box mr={0.5}>({symbol}):</Box>
						<Box mr={0.5}>{amount}</Box>
						{amountMainCurrency && !!mainCurrency && (
							<Box mr={0.5} color='text.secondary' fontSize='caption.fontSize'>
								{mainCurrency.symbolPosition === 'left'
									? `(${mainCurrency.symbol} ${amountMainCurrency})`
									: `${amountMainCurrency} {${mainCurrency.symbol}}`}
							</Box>
						)}
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
export const DiversifyPreview = ({
	feesData = {},
	assetsData,
	prices,
	mainCurrency,
}) => {
	const classes = useStyles()
	const { spendTokenAddr } = feesData
	const { tokensOutData = [] } = feesData.actionMeta || {}
	const fromAssetData = assetsData[spendTokenAddr] || {}
	const { name, symbol } = fromAssetData
	const fromMainCurrencyValue = getMainCurrencyValue({
		asset: symbol,
		floatAmount: feesData.totalAmountToSpendFormatted,
		prices,
		mainCurrency,
	})

	// console.log('fromAssetData', fromAssetData)
	// console.log('feesData', feesData)

	return (
		<Box>
			<Box p={1}>
				<Alert variant='filled' severity='info'>
					{t('WALLET_FEES_INFO_SWAP')}
				</Alert>
			</Box>
			<PropRow
				key='fromAsset'
				left={t('From')}
				right={
					<TokenRow
						{...{
							address: spendTokenAddr,
							name,
							classes,
							symbol,
							amount: feesData.totalAmountToSpendFormatted,
							amountMainCurrency: fromMainCurrencyValue,
							mainCurrency,
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
				key='tooAssetsDib'
				left={t('Diversify to')}
				right={
					<Box>
						{tokensOutData.map(({ address, amountOutMin, share }) => {
							const { name, symbol } = assetsData[address]
							const amountMainCurrency = getMainCurrencyValue({
								asset: symbol,
								floatAmount: amountOutMin,
								prices,
								mainCurrency,
							})
							return (
								<TokenRow
									key={address}
									{...{
										address,
										name,
										classes,
										symbol,
										share,
										amount: amountOutMin,
										amountMainCurrency,
										mainCurrency,
										secondary: t('SHARE_INFO', { args: [share] }),
									}}
								/>
							)
						})}
					</Box>
				}
			/>
		</Box>
	)
}

export const TradePreview = ({
	withdrawTo,
	feesData,
	// symbol = 'xx',
	assetsData,
	prices,
	mainCurrency,
}) => {
	const classes = useStyles()

	const { tradeData = {} } = feesData.actionMeta || {}
	const fromAssetData = assetsData[tradeData.fromAsset] || {}

	// console.log('fromAssetData', fromAssetData)
	// console.log('feesData', feesData)

	const { name, symbol } = fromAssetData
	const { name: outName, symbol: outSymbol } =
		assetsData[tradeData.toAsset] || {}

	const fromMainCurrencyValue = getMainCurrencyValue({
		asset: symbol,
		floatAmount: feesData.totalAmountToSpendFormatted,
		prices,
		mainCurrency,
	})

	const ftoMainCurrencyValue = getMainCurrencyValue({
		asset: outSymbol,
		floatAmount: tradeData.expectedAmountOut,
		prices,
		mainCurrency,
	})
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
							name,
							classes,
							symbol,
							amount: feesData.totalAmountToSpendFormatted,
							amountMainCurrency: fromMainCurrencyValue,
							mainCurrency,
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
							name: outName,
							classes,
							symbol: outSymbol,
							amount: tradeData.expectedAmountOut,
							amountMainCurrency: ftoMainCurrencyValue,
							mainCurrency,
							secondary: t('SWAP_ESTIMATED_INFO'),
						}}
					/>
				}
			/>
		</Box>
	)
}

export const WithdrawPreview = ({
	withdrawTo,
	feesData,
	assetsData,
	prices,
	mainCurrency,
}) => {
	const classes = useStyles()
	const { symbol, name } = assetsData[feesData.spendTokenAddr] || {}

	const amountMainCurrency = getMainCurrencyValue({
		asset: symbol,
		floatAmount: feesData.totalAmountToSpendFormatted,
		prices,
		mainCurrency,
	})

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
							name,
							classes,
							symbol,
							amount: feesData.totalAmountToSpendFormatted,
							amountMainCurrency,
							mainCurrency,
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
