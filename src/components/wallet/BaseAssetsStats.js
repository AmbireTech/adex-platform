import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { Box, Paper } from '@material-ui/core'
import { TreeView, TreeItem } from '@material-ui/lab'
import { ExpandMore, ChevronRight } from '@material-ui/icons'
import { AmountText } from 'components/common/amount'

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
										<AmountText text={`${x.total} ${x.symbol}`} fontSize={25} />
										{' ('}
										<AmountText
											text={`$ ${x.assetToMainCurrenciesValues['USD'].toFixed(
												2
											)}`}
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
										<AmountText
											text={`${x.balance} ${x.symbol}`}
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
												<AmountText
													text={`${y.balance} ${x.symbol}`}
													fontSize={20}
												/>
												{' ('}
												<AmountText
													text={`${y.baseTokenBalance[1]} ${y
														.baseTokenBalance[0] || x.symbol}`}
													fontSize={16}
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
