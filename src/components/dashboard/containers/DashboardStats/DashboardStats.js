import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { Box, Paper, Grid } from '@material-ui/core'
import SideSelect from 'components/signin/side-select/SideSelect'
import { BasicStats } from './BasicStats'
import {
	t,
	selectSide,
	selectPublisherStatsByCountryTableData,
	selectPublisherStatsByCountryMapChartData,
} from 'selectors'
import BestEarnersTable from 'components/dashboard/containers/Tables/BestEarnersTable'
import StatsByCountryTable from 'components/dashboard/containers/Tables/StatsByCountryTable'
import StatsByCountryMapChart from 'components/dashboard/charts/StatsByCountryMapChart'

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
			{side === 'publisher' && (
				<Box pt={2}>
					<Grid container spacing={2}>
						<Grid item xs={12} md={12} lg={6}>
							<StatsByCountryMapChart
								selector={selectPublisherStatsByCountryMapChartData}
							/>
							<StatsByCountryTable
								selector={selectPublisherStatsByCountryTableData}
								title={t('TABLE_COUNTRY_STATS_THIS_MONTH')}
							/>
						</Grid>
						<Grid item xs={12} md={12} lg={6}>
							<BestEarnersTable />
						</Grid>
					</Grid>
				</Box>
			)}
		</Fragment>
	)
}

export default DashboardStats
