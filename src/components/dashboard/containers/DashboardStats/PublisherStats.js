import React, { Fragment, useState } from 'react'
import { Box, Grid, Paper, Typography, Tab, Tabs } from '@material-ui/core'
import {
	ItemTabsBar,
	ItemTabsContainer,
} from 'components/dashboard/containers/ItemCommon/'
import BestEarnersTable from 'components/dashboard/containers/Tables/BestEarnersTable'
import StatsByCountryTable from 'components/dashboard/containers/Tables/StatsByCountryTable'
import MapChart from 'components/dashboard/charts/map/MapChart'
import { BasicStats } from './BasicStats'
import {
	t,
	selectPublisherStatsByCountryTableData,
	selectPublisherStatsByCountryMapChartData,
} from 'selectors'
import { timeSinceEpoch } from 'helpers/formatters'

export function PublisherStats() {
	const [tabIndex, setTabIndex] = useState(0)
	return (
		<Fragment>
			<ItemTabsBar>
				<Tabs
					value={tabIndex}
					onChange={(ev, index) => setTabIndex(index)}
					variant='scrollable'
					scrollButtons='auto'
					indicatorColor='primary'
					textColor='primary'
				>
					<Tab label={t('CHARTS')} />
					<Tab label={t('COUNTRY_DATA')} />
					<Tab label={t('TABLE_BEST_EARNERS_UNITS_TITLE')} />
				</Tabs>
			</ItemTabsBar>
			<ItemTabsContainer noBackground>
				{tabIndex === 0 && (
					<Box p={1}>
						<BasicStats side='publisher' />
					</Box>
				)}
				{tabIndex === 1 && (
					<Box p={1}>
						<Grid container spacing={1}>
							<Grid item xs={12}>
								<Box>
									<Typography variant='button' align='center'>
										{t('COUNTRY_STATS_PERIOD', { args: timeSinceEpoch() })}
									</Typography>
								</Box>
							</Grid>
							<Grid item xs={12} md={12} lg={6}>
								<MapChart
									selector={selectPublisherStatsByCountryMapChartData}
									chartId='publisher-stats'
								/>
							</Grid>

							<Grid item xs={12} md={12} lg={6}>
								<Paper variant='outlined'>
									<StatsByCountryTable
										tableId='publisherStatsByCountry'
										selector={selectPublisherStatsByCountryTableData}
										// TODO: uncomment after 26.04.2020
										showEarnings
									/>
								</Paper>
							</Grid>
						</Grid>
					</Box>
				)}
				{tabIndex === 2 && (
					// <Box p={1}>
					<BestEarnersTable
						tableId='publisherBestEarnersStats'
						title='TABLE_BEST_EARNERS_UNITS_TITLE'
					/>
					// </Box>
				)}
			</ItemTabsContainer>
		</Fragment>
	)
}

export default PublisherStats
