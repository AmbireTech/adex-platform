import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { Box, Paper } from '@material-ui/core'
import { TreeView, TreeItem } from '@material-ui/lab'
import { ExpandMore, ChevronRight } from '@material-ui/icons'
import { AmountWithCurrency } from 'components/common/amount'

import { t, selectAccountStatsFormatted } from 'selectors'

function BaseAssetsStats() {
	const { assetsData = {} } = useSelector(selectAccountStatsFormatted)

	return (
		<Fragment>
			<Paper variant='outlined'>
				<Box p={2}>
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
											fontSize={25}
										/>
										{' ('}
										<AmountWithCurrency
											amount={x.assetToMainCurrenciesValues['USD']}
											unit={'$'}
											unitPlace='left'
											fontSize={17}
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
											fontSize={20}
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
													fontSize={20}
												/>
												{' ('}
												<AmountWithCurrency
													amount={y.baseTokenBalance[1]}
													unit={y.baseTokenBalance[0] || x.symbol}
													fontSize={15}
												/>
												{')'}
											</Box>
										}
									/>
								))}
							</TreeItem>
						))}
					</TreeView>
				</Box>
			</Paper>
		</Fragment>
	)
}

export default BaseAssetsStats
