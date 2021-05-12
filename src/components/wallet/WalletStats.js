import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import {
	Box,
	// Paper,
	Grid,
} from '@material-ui/core'
import { TreeView, TreeItem } from '@material-ui/lab'
import { ExpandMore, ChevronRight } from '@material-ui/icons'
import { AmountWithCurrency } from 'components/common/amount'
import { InfoCard } from './WalletInfoCard'
import { TradeAssets } from 'components/wallet/forms/walletTransactions'

import { t, selectAccountStatsFormatted } from 'selectors'

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
						</Box>
					</Box>
				</InfoCard>
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
