import React from 'react'
import { useSelector } from 'react-redux'
import {
	Box,
	// Paper,
	Grid,
} from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles'
// import { TreeView, TreeItem } from '@material-ui/lab'
// import { ExpandMore, ChevronRight } from '@material-ui/icons'
import { AmountWithCurrency } from 'components/common/amount'
import { InfoCard } from './WalletInfoCard'
import { Stop as StopIcon } from '@material-ui/icons'
import {
	TradeAssets,
	DiversifyAssets,
	WithdrawMultipleAssets,
} from 'components/wallet/forms/walletTransactions'
import { Doughnut } from 'react-chartjs-2'

import WalletAssetsTable from './WalletAssetsTable'

import { t, selectAccountStatsFormatted, selectMainCurrency } from 'selectors'

const WalletDoughnut = ({
	assetsData,
	totalMainCurrenciesValues,
	mainCurrency,
}) => {
	const theme = useTheme()

	const chartColors = [
		...(theme.palette.chartColors ? theme.palette.chartColors.all : []),
	]

	const { labels, values } = Object.values(assetsData)
		.filter(x => x.isBaseAsset)
		.reduce(
			(data, asset) => {
				data.labels.push(asset.symbol)
				data.values.push(
					((asset.assetTotalToMainCurrenciesValues[mainCurrency.id] || 0) /
						(totalMainCurrenciesValues[mainCurrency.id] || 1)) *
						100
				)
				return data
			},
			{
				labels: [],
				values: [],
			}
		)

	const data = {
		labels,
		datasets: [
			{
				backgroundColor: chartColors,
				hoverBackgroundColor: chartColors,
				borderWidth: 0,
				data: values,
				label: t('ASSET_SHARE'),
			},
		],
	}

	return (
		<Grid container spacing={2} alignItems='center'>
			<Grid item xs={12} sm={5}>
				<Box position='relative' width='100%' height='100%' paddingTop='100%'>
					<Box
						position='absolute'
						top={0}
						bottom={0}
						width='100%'
						height='100%'
						zIndex={1}
					>
						<Doughnut
							width={120}
							height={120}
							data={data}
							options={{
								cutoutPercentage: 70,
								responsive: true,
								legend: {
									display: false,
								},
								title: {
									display: false,
								},
								animation: false,
								tooltips: {
									callbacks: {
										label: function(item, data) {
											return (
												data.labels[item.index] +
												': ' +
												data.datasets[item.datasetIndex].data[
													item.index
												].toFixed(2) +
												'%'
											)
										},
									},
								},
							}}
							style={{
								position: 'absolute',
								top: 0,
								bottom: 0,
								width: '100%',
								height: '100%',
							}}
						/>
					</Box>
				</Box>
			</Grid>
			<Grid item xs={12} sm={7}>
				<Box>
					{data.labels.map((label, index) => {
						return (
							<Box
								key={label + index}
								display='flex'
								flexDirection='row'
								alignItems='center'
								justifyContent='space-between'
							>
								<Box
									display='flex'
									flexDirection='row'
									//   alignItems='center'
								>
									<StopIcon
										style={{ color: chartColors[index % chartColors.length] }}
										fontSize='small'
									/>
									<Box> {label} </Box>
								</Box>
								<Box color='text.primary' fontWeight='fontWeightBold'>
									{data.datasets[0].data[index].toFixed(2)}%
								</Box>
							</Box>
						)
					})}
				</Box>
			</Grid>
		</Grid>
	)
}

function WalletStats() {
	const { assetsData = {}, totalMainCurrenciesValues = {} } = useSelector(
		selectAccountStatsFormatted
	)

	const mainCurrency = useSelector(selectMainCurrency)
	const noBalance =
		!totalMainCurrenciesValues[mainCurrency.id] ||
		parseFloat(totalMainCurrenciesValues[mainCurrency.id]) === 0

	return (
		<Grid container spacing={2} alignItems='stretch' direction='row'>
			<Grid item xs={12} md={6}>
				<InfoCard title={t('PORTFOLIO_VALUE')}>
					<Box
						display='flex'
						flexDirection='column'
						justifyContent='space-between'
						height={1}
					>
						<Box>
							<AmountWithCurrency
								toFixed={2}
								amount={totalMainCurrenciesValues[mainCurrency.id]}
								unit={mainCurrency.symbol}
								unitPlace={mainCurrency.symbolPosition}
								mainFontVariant='h2'
								decimalsFontVariant='h3'
							/>
						</Box>
						<Box
							mt={4}
							display='flex'
							flexDirection='row'
							flexWrap='wrap'
							justifyContent='stretch'
						>
							<Box m={0.5}>
								<TradeAssets
									variant='contained'
									color='secondary'
									size='large'
									dialogWidth={512}
									dialogHeight={800}
								/>
							</Box>
							<Box m={0.5}>
								<DiversifyAssets
									variant='contained'
									color='primary'
									size='large'
									dialogWidth={512}
									dialogHeight={800}
								/>
							</Box>
							<Box m={0.5}>
								<WithdrawMultipleAssets
									variant='contained'
									color='primary'
									size='large'
									dialogWidth={512}
									dialogHeight={800}
								/>
							</Box>
						</Box>
					</Box>
				</InfoCard>
			</Grid>
			<Grid item xs={12} md={6}>
				<InfoCard title={t('PORTFOLIO_BY_ASSETS')}>
					{noBalance ? (
						t('NO_ASSETS_ADDED')
					) : (
						<WalletDoughnut
							assetsData={assetsData}
							totalMainCurrenciesValues={totalMainCurrenciesValues}
							mainCurrency={mainCurrency}
						/>
					)}
				</InfoCard>
			</Grid>

			{/* <Grid item xs={12} md={6}>
				<InfoCard title={t('By asset')}>
					<TreeView
						defaultCollapseIcon={<ExpandMore />}
						defaultExpandIcon={<ChevronRight />}
					>
						{Object.values(assetsData).map((x, i) => (
							<TreeItem
								key={x.address}
								nodeId={x.address + '-' + i}
								label={
									<Box>
										<AmountWithCurrency
											amount={x.total}
											unit={x.symbol}
											mainFontVariant='h6'
											decimalsFontVariant='subtitle1'
										/>
										{' ('}
										<AmountWithCurrency
											amount={
												(x.assetTotalToMainCurrenciesValues || {})[
													mainCurrency.id
												]
											}
											unit={'$'}
											unitPlace='left'
											mainFontVariant='body1'
											decimalsFontVariant='caption'
										/>
										{')'}
									</Box>
								}
							>
								<TreeItem
									key={x.address}
									nodeId={x.address}
									label={
										<AmountWithCurrency
											amount={x.balance}
											unit={x.symbol}
											mainFontVariant='h6'
											decimalsFontVariant='subtitle1'
										/>
									}
								/>
								{(x.specific || []).map((y, j) => (
									<TreeItem
										key={y.address + '-' + j}
										nodeId={`${i}-${j}`}
										label={
											<Box>
												<AmountWithCurrency
													amount={y.balance}
													unit={y.symbol}
													mainFontVariant='h6'
													decimalsFontVariant='subtitle1'
												/>
												{' ('}
												<AmountWithCurrency
													amount={y.baseTokenBalance[1]}
													unit={y.baseTokenBalance[0] || x.symbol}
													mainFontVariant='body1'
													decimalsFontVariant='caption'
												/>
												{')'}
											</Box>
										}
									/>
								))}
							</TreeItem>
						))}
					</TreeView>
				</InfoCard>
			</Grid> */}
			<Grid item xs={12}>
				<WalletAssetsTable />
			</Grid>
		</Grid>
	)
}

export default WalletStats
