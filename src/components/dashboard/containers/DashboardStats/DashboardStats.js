import React, { Fragment } from 'react'
import { useSelector } from 'react-redux'
import { Box, Paper, Grid, Typography } from '@material-ui/core'
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
							<Paper>
								<Box p={2} mb={2}>
									<Typography variant='button' align='center'>
										{t('COUNTRY_STATS_PERIOD', { args: ['30', 'DAYS'] })}
									</Typography>
								</Box>
							</Paper>

							<StatsByCountryMapChart
								selector={selectPublisherStatsByCountryMapChartData}
							/>
							<StatsByCountryTable
								selector={selectPublisherStatsByCountryTableData}
								// TODO: uncomment after 26.04.2020
								// showEarnings
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
