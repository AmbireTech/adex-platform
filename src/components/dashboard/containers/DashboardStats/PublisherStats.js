import React, { Fragment, useState } from 'react'
import { useSelector } from 'react-redux'
import {
	Box,
	Grid,
	Paper,
	Typography,
	Tab,
	Tabs,
	LinearProgress,
} from '@material-ui/core'
import BestEarnersTable from 'components/dashboard/containers/Tables/BestEarnersTable'
import StatsByCountryTable from 'components/dashboard/containers/Tables/StatsByCountryTable'
import MapChart from 'components/dashboard/charts/map/MapChart'
import { BasicStats } from './BasicStats'
import {
	t,
	selectPublisherStatsByCountryTableData,
	selectPublisherStatsByCountryMapChartData,
	selectBestEarnersTableData,
	selectInitialDataLoadedByData,
} from 'selectors'

export function PublisherStats() {
	const [tabIndex, setTabIndex] = useState(0)
	const dataLoaded = useSelector(state =>
		selectInitialDataLoadedByData(state, 'advancedAnalytics')
	)

	return (
		<Fragment>
			<Paper position='static' variant='outlined'>
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
			</Paper>
			<Box my={1}>
				{tabIndex === 0 && (
					<Paper variant='outlined'>
						<Box p={1}>
							<BasicStats side='publisher' />
						</Box>
					</Paper>
				)}
				{tabIndex === 1 && (
					<Grid container spacing={1}>
						<Grid item xs={12}>
							<Paper variant='outlined'>
								<Box p={2}>
									<Typography variant='button' align='center'>
										{t('COUNTRY_STATS_PERIOD', { args: ['30', 'DAYS'] })}
									</Typography>
								</Box>
							</Paper>
							{!dataLoaded && <LinearProgress />}
						</Grid>
						<Grid item xs={12} md={12} lg={6}>
							<MapChart selector={selectPublisherStatsByCountryMapChartData} />
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
