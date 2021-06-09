import React from 'react'
import { useSelector } from 'react-redux'
import {
	Box,
	// Paper,
	Grid,
} from '@material-ui/core'
import { useTheme } from '@material-ui/core/styles'
import { TreeView, TreeItem } from '@material-ui/lab'
import { ExpandMore, ChevronRight } from '@material-ui/icons'
import { AmountWithCurrency } from 'components/common/amount'
import { InfoCard } from './WalletInfoCard'
import { Stop as StopIcon } from '@material-ui/icons'
import {
	TradeAssets,
	DiversifyAssets,
} from 'components/wallet/forms/walletTransactions'
import { Doughnut } from 'react-chartjs-2'

import { t, selectAccountStatsFormatted } from 'selectors'

const WalletDoughnut = ({ assetsData }) => {
	const theme = useTheme()

	const chartColors = [
		...(theme.palette.chartColors ? theme.palette.chartColors.all : []),
	]

	const { labels, values } = Object.values(assetsData).reduce(
		(data, asset) => {
			data.labels.push(asset.symbol)
			data.values.push(asset.assetToMainCurrenciesValues['USD'])
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
			<Grid item xs={5}>
				<Box position='relative' width='100%' height='100%' paddingTop='100%'>
					<Box
						position='absolute'
						top={0}
						bottom={0}
						width='100%'
						height='100%'
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
												data.datasets[item.datasetIndex].data[item.index]
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
					<Box
						display='flex'
						flexDirection='column'
						alignItems='center'
						justifyContent='center'
						position='absolute'
						width='70%'
						height='70%'
						backgroundColor='background.paper'
						left='15%'
						top='15%'
						borderRadius='50%'
					>
						<Box>{}</Box>
						<Box>{t('TOTAL')}</Box>
					</Box>{' '}
				</Box>
			</Grid>
			<Grid item xs={7}>
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
									<Box
										style={{ color: chartColors[index % chartColors.length] }}
									>
										<StopIcon color='inherit' fontSize='small' />
									</Box>
									<Box> {label} </Box>
								</Box>
								<Box color='text.primary' fontWeight='fontWeightBold'>
									{data.datasets[0].data[index]}%
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

	return (
		<Grid container spacing={2} alignItems='stretch' direction='row'>
			<Grid item xs={12} md={6}>
				<InfoCard title={t('PORTFOLIO VALUE')}>
					<Box>
						<Box>
							<AmountWithCurrency
								amount={totalMainCurrenciesValues['USD']}
								unit={'$'}
								unitPlace='left'
								mainFontVariant='h2'
								decimalsFontVariant='h3'
							/>
						</Box>
						<Box mt={4}>
							<TradeAssets
								variant='contained'
								color='secondary'
								size='large'
								dialogWidth={512}
								dialogHeight={800}
							/>
							<DiversifyAssets
								variant='contained'
								color='secondary'
								size='large'
								dialogWidth={700}
								dialogHeight={1000}
							/>
						</Box>
					</Box>
				</InfoCard>
			</Grid>
			<Grid item xs={12} md={6}>
				<WalletDoughnut assetsData={assetsData} />
			</Grid>

			<Grid item xs={12} md={6}>
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
											amount={x.assetToMainCurrenciesValues['USD']}
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
			</Grid>
		</Grid>
	)
}

export default WalletStats
