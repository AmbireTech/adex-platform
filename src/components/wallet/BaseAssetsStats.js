import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { Box, Paper } from '@material-ui/core'
import { TreeView, TreeItem } from '@material-ui/lab'
import { ExpandMore, ChevronRight } from '@material-ui/icons'

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
								label={x.total + ' ' + x.symbol}
							>
								<TreeItem
									key={x.address}
									nodeId={x.address}
									label={x.balance + ' ' + x.symbol}
								/>
								{(x.specific || []).map((y, j) => (
									<TreeItem
										key={y.address + '-' + j}
										nodeId={`${i}-${j}`}
										label={`${y.balance}  ${y.symbol} (${
											y.baseTokenBalance[1]
										} ${y.baseTokenBalance[0] || x.symbol})`}
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
