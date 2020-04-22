import React, { Fragment, useState } from 'react'
import { Box, Grid, Paper, Typography } from '@material-ui/core'
import { PublisherTab, PublisherTabs, PublisherAppBar } from 'components/styled'
import BestEarnersTable from 'components/dashboard/containers/Tables/BestEarnersTable'
import StatsByCountryTable from 'components/dashboard/containers/Tables/StatsByCountryTable'
import MapChart from 'components/dashboard/charts/map/MapChart'
import { BasicStats } from './BasicStats'
import {
	t,
	selectPublisherStatsByCountryTableData,
	selectPublisherStatsByCountryMapChartData,
	selectBestEarnersTableData,
} from 'selectors'

export function PublisherStats() {
	const [tabIndex, setTabIndex] = useState(0)

	return (
		<Fragment>
			<PublisherAppBar position='static'>
				<PublisherTabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					variant='scrollable'
					scrollButtons='auto'
				>
					<PublisherTab label={t('CHARTS')} />
					<PublisherTab label={t('COUNTRY_DATA')} />
					<PublisherTab label={t('TABLE_BEST_EARNERS_UNITS_TITLE')} />
				</PublisherTabs>
			</PublisherAppBar>
			<Box my={2}>
				{tabIndex === 0 && (
					<Paper>
						<Paper elevation={2}>
							<Box p={1}>
								<BasicStats side='publisher' />
							</Box>
						</Paper>
					</Paper>
				)}
				{tabIndex === 1 && (
					<Grid container spacing={2}>
						<Grid item xs={12} md={12} lg={6}>
							<Paper>
								<Box p={2} mb={2}>
									<Typography variant='button' align='center'>
										{t('COUNTRY_STATS_PERIOD', { args: ['30', 'DAYS'] })}
									</Typography>
								</Box>
							</Paper>

							<Box>
								<MapChart
									selector={selectPublisherStatsByCountryMapChartData}
								/>
							</Box>
						</Grid>

						<Grid item xs={12} md={12} lg={6}>
							<StatsByCountryTable
								selector={selectPublisherStatsByCountryTableData}
								// TODO: uncomment after 26.04.2020
								// showEarnings
							/>
						</Grid>
					</Grid>
				)}
				{tabIndex === 2 && (
					<BestEarnersTable
						selector={selectBestEarnersTableData}
						title='TABLE_BEST_EARNERS_UNITS_TITLE'
					/>
				)}
			</Box>
		</Fragment>
	)
}

export default PublisherStats
