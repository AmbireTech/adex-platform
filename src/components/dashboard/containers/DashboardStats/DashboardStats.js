import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { Box, Paper, Grid } from '@material-ui/core'
import SideSelect from 'components/signin/side-select/SideSelect'
import { BasicStats } from './BasicStats'
import { selectSide, selectPublisherStatsByCountryTableData } from 'selectors'
import BestEarnersTable from '../Tables/BestEarnersTable'
import ImpressionsByCountryTableMap from '../Tables/ImpressionsByCountryTableMap'

export function DashboardStats(props) {
	const side = useSelector(selectSide)

	return side !== 'advertiser' && side !== 'publisher' ? (
		<SideSelect active={true} />
	) : (
		<Fragment>
			<Paper elevation={2}>
				<Box p={1}>
					<BasicStats side={side} />
				</Box>
			</Paper>
			<Box pt={2}>
				<Grid container spacing={2}>
					{side === 'publisher' && (
						<Fragment>
							<Grid item xs={12} md={12} lg={6}>
								<BestEarnersTable />
							</Grid>
							<Grid item xs={12} md={12} lg={6}>
								<ImpressionsByCountryTableMap
									selector={selectPublisherStatsByCountryTableData}
								/>
							</Grid>
						</Fragment>
					)}
				</Grid>
			</Box>
		</Fragment>
	)
}

export default DashboardStats
